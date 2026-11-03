const express = require('express');
const pool = require('../db/pool');
const { authRequired } = require('../middleware/auth');
const { generatePickupCode } = require('../utils/pickupCode');

const router = express.Router();

// POST /api/orders  { partnerId, items: [{ listingId, quantity }], pickupWindowStart, pickupWindowEnd }
router.post('/', authRequired('customer'), async (req, res) => {
  const { partnerId, items, pickupWindowStart, pickupWindowEnd } = req.body;
  if (!partnerId || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'partnerId and at least one item are required' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    let total = 0;
    const priced = [];

    for (const item of items) {
      const listingResult = await client.query(
        `SELECT * FROM listings WHERE id = $1 AND partner_id = $2 FOR UPDATE`,
        [item.listingId, partnerId]
      );
      const listing = listingResult.rows[0];
      if (!listing) throw new HttpError(404, `Listing ${item.listingId} not found for this partner`);
      if (listing.status !== 'active' || new Date(listing.expires_at) <= new Date()) {
        throw new HttpError(409, `${listing.title} is no longer available`);
      }
      if (listing.quantity_available < item.quantity) {
        throw new HttpError(409, `Not enough stock left for ${listing.title}`);
      }
      total += Number(listing.discounted_price) * item.quantity;
      priced.push({ listing, quantity: item.quantity });
    }

    const pickupCode = generatePickupCode();
    const orderResult = await client.query(
      `INSERT INTO orders (user_id, partner_id, total_amount, pickup_window_start, pickup_window_end, pickup_code)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.auth.sub, partnerId, total.toFixed(2), pickupWindowStart, pickupWindowEnd, pickupCode]
    );
    const order = orderResult.rows[0];

    for (const { listing, quantity } of priced) {
      await client.query(
        `INSERT INTO order_items (order_id, listing_id, quantity, price_at_purchase) VALUES ($1, $2, $3, $4)`,
        [order.id, listing.id, quantity, listing.discounted_price]
      );
      const newQty = listing.quantity_available - quantity;
      await client.query(
        `UPDATE listings SET quantity_available = $1, status = CASE WHEN $1 <= 0 THEN 'sold_out' ELSE status END
         WHERE id = $2`,
        [newQty, listing.id]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ order });
  } catch (err) {
    await client.query('ROLLBACK');
    if (err instanceof HttpError) return res.status(err.status).json({ error: err.message });
    console.error(err);
    res.status(500).json({ error: 'Failed to place order' });
  } finally {
    client.release();
  }
});

router.get('/', authRequired('customer'), async (req, res) => {
  const result = await pool.query(
    `SELECT o.*, p.name AS partner_name, p.logo_url, p.address AS partner_address,
            (r.id IS NOT NULL) AS has_review
     FROM orders o
     JOIN partners p ON p.id = o.partner_id
     LEFT JOIN reviews r ON r.order_id = o.id
     WHERE o.user_id = $1
     ORDER BY o.created_at DESC`,
    [req.auth.sub]
  );
  res.json({ orders: result.rows });
});

// Must come before /:id so "impact" isn't captured as an order id.
router.get('/impact/summary', authRequired('customer'), async (req, res) => {
  const result = await pool.query(
    `SELECT
        COUNT(DISTINCT o.id) FILTER (WHERE o.payment_status = 'paid')::int AS total_orders,
        COALESCE(SUM(oi.quantity) FILTER (WHERE o.payment_status = 'paid'), 0)::int AS bags_rescued,
        COALESCE(SUM(oi.quantity * (l.original_price - oi.price_at_purchase)) FILTER (WHERE o.payment_status = 'paid'), 0) AS total_saved,
        COALESCE(SUM(oi.quantity * oi.price_at_purchase) FILTER (WHERE o.payment_status = 'paid'), 0) AS total_spent
     FROM orders o
     JOIN order_items oi ON oi.order_id = o.id
     JOIN listings l ON l.id = oi.listing_id
     WHERE o.user_id = $1`,
    [req.auth.sub]
  );
  res.json(result.rows[0]);
});

router.get('/:id', authRequired('customer'), async (req, res) => {
  const orderResult = await pool.query(
    `SELECT o.*, p.name AS partner_name, p.logo_url, p.address AS partner_address
     FROM orders o JOIN partners p ON p.id = o.partner_id
     WHERE o.id = $1 AND o.user_id = $2`,
    [req.params.id, req.auth.sub]
  );
  const order = orderResult.rows[0];
  if (!order) return res.status(404).json({ error: 'Order not found' });

  const itemsResult = await pool.query(
    `SELECT oi.*, l.title FROM order_items oi JOIN listings l ON l.id = oi.listing_id WHERE oi.order_id = $1`,
    [order.id]
  );
  res.json({ order, items: itemsResult.rows });
});

router.put('/:id/cancel', authRequired('customer'), async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const orderResult = await client.query(
      `SELECT * FROM orders WHERE id = $1 AND user_id = $2 FOR UPDATE`,
      [req.params.id, req.auth.sub]
    );
    const order = orderResult.rows[0];
    if (!order) throw new HttpError(404, 'Order not found');
    if (order.status !== 'placed') throw new HttpError(409, 'Only a placed order can be cancelled');

    const items = await client.query('SELECT * FROM order_items WHERE order_id = $1', [order.id]);
    for (const item of items.rows) {
      await client.query(
        `UPDATE listings SET quantity_available = quantity_available + $1,
                              status = CASE WHEN status = 'sold_out' THEN 'active' ELSE status END
         WHERE id = $2`,
        [item.quantity, item.listing_id]
      );
    }

    const updated = await client.query(
      `UPDATE orders SET status = 'cancelled',
                          payment_status = CASE WHEN payment_status = 'paid' THEN 'refunded' ELSE payment_status END
       WHERE id = $1 RETURNING *`,
      [order.id]
    );

    await client.query('COMMIT');
    res.json({ order: updated.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    if (err instanceof HttpError) return res.status(err.status).json({ error: err.message });
    console.error(err);
    res.status(500).json({ error: 'Failed to cancel order' });
  } finally {
    client.release();
  }
});

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

module.exports = router;
