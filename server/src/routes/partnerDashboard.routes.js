const express = require('express');
const multer = require('multer');
const pool = require('../db/pool');
const { authRequired } = require('../middleware/auth');
const { uploadImage } = require('../utils/imageStorage');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const router = express.Router();
router.use(authRequired('partner_staff'));

// ---- Listings management ----

router.get('/listings', async (req, res) => {
  const result = await pool.query(
    `SELECT * FROM listings WHERE partner_id = $1 ORDER BY created_at DESC`,
    [req.auth.partnerId]
  );
  res.json({ listings: result.rows });
});

router.post('/listings', async (req, res) => {
  const {
    title, description, original_price, discounted_price,
    quantity_available, pickup_window_start, pickup_window_end, expires_at, image_url
  } = req.body;

  if (!title || !original_price || !discounted_price || !quantity_available || !pickup_window_start || !pickup_window_end || !expires_at) {
    return res.status(400).json({ error: 'Missing required listing fields' });
  }

  const result = await pool.query(
    `INSERT INTO listings (partner_id, title, description, original_price, discounted_price,
                            quantity_available, pickup_window_start, pickup_window_end, expires_at, image_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
    [req.auth.partnerId, title, description || null, original_price, discounted_price,
      quantity_available, pickup_window_start, pickup_window_end, expires_at, image_url || null]
  );
  res.status(201).json({ listing: result.rows[0] });
});

router.put('/listings/:id', async (req, res) => {
  const { title, description, discounted_price, quantity_available, status } = req.body;
  const result = await pool.query(
    `UPDATE listings SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        discounted_price = COALESCE($3, discounted_price),
        quantity_available = COALESCE($4, quantity_available),
        status = COALESCE($5, status)
     WHERE id = $6 AND partner_id = $7 RETURNING *`,
    [title, description, discounted_price, quantity_available, status, req.params.id, req.auth.partnerId]
  );
  if (!result.rows[0]) return res.status(404).json({ error: 'Listing not found' });
  res.json({ listing: result.rows[0] });
});

router.delete('/listings/:id', async (req, res) => {
  const result = await pool.query(
    `UPDATE listings SET status = 'cancelled' WHERE id = $1 AND partner_id = $2 RETURNING *`,
    [req.params.id, req.auth.partnerId]
  );
  if (!result.rows[0]) return res.status(404).json({ error: 'Listing not found' });
  res.json({ listing: result.rows[0] });
});

router.post('/listings/:id/image', upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'image file is required' });
  try {
    const owned = await pool.query('SELECT id FROM listings WHERE id = $1 AND partner_id = $2', [
      req.params.id,
      req.auth.partnerId
    ]);
    if (!owned.rows[0]) return res.status(404).json({ error: 'Listing not found' });

    const ext = (req.file.originalname.split('.').pop() || 'jpg').toLowerCase();
    const path = `listings/${req.params.id}-${Date.now()}.${ext}`;
    const publicUrl = await uploadImage(req.file.buffer, path, req.file.mimetype);

    const result = await pool.query(
      `UPDATE listings SET image_url = $1 WHERE id = $2 AND partner_id = $3 RETURNING *`,
      [publicUrl, req.params.id, req.auth.partnerId]
    );
    res.json({ listing: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Image upload failed' });
  }
});

router.post('/logo', upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'image file is required' });
  try {
    const ext = (req.file.originalname.split('.').pop() || 'jpg').toLowerCase();
    const path = `partners/${req.auth.partnerId}-${Date.now()}.${ext}`;
    const publicUrl = await uploadImage(req.file.buffer, path, req.file.mimetype);

    const result = await pool.query(`UPDATE partners SET logo_url = $1 WHERE id = $2 RETURNING *`, [
      publicUrl,
      req.auth.partnerId
    ]);
    res.json({ partner: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Image upload failed' });
  }
});

// ---- Item master (reusable dish catalog) ----

router.get('/items', async (req, res) => {
  const result = await pool.query(
    `SELECT * FROM partner_items WHERE partner_id = $1 ORDER BY name`,
    [req.auth.partnerId]
  );
  res.json({ items: result.rows });
});

router.post('/items', async (req, res) => {
  const { name, description, category, original_price, discounted_price } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });

  const result = await pool.query(
    `INSERT INTO partner_items (partner_id, name, description, category, original_price, discounted_price)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [req.auth.partnerId, name, description || null, category || null, original_price || null, discounted_price || null]
  );
  res.status(201).json({ item: result.rows[0] });
});

router.put('/items/:id', async (req, res) => {
  const { name, description, category, original_price, discounted_price } = req.body;
  const result = await pool.query(
    `UPDATE partner_items SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        category = COALESCE($3, category),
        original_price = COALESCE($4, original_price),
        discounted_price = COALESCE($5, discounted_price)
     WHERE id = $6 AND partner_id = $7 RETURNING *`,
    [name, description, category, original_price, discounted_price, req.params.id, req.auth.partnerId]
  );
  if (!result.rows[0]) return res.status(404).json({ error: 'Item not found' });
  res.json({ item: result.rows[0] });
});

router.delete('/items/:id', async (req, res) => {
  const result = await pool.query(
    `DELETE FROM partner_items WHERE id = $1 AND partner_id = $2 RETURNING id`,
    [req.params.id, req.auth.partnerId]
  );
  if (!result.rows[0]) return res.status(404).json({ error: 'Item not found' });
  res.status(204).end();
});

router.post('/items/:id/image', upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'image file is required' });
  try {
    const owned = await pool.query('SELECT id FROM partner_items WHERE id = $1 AND partner_id = $2', [
      req.params.id,
      req.auth.partnerId
    ]);
    if (!owned.rows[0]) return res.status(404).json({ error: 'Item not found' });

    const ext = (req.file.originalname.split('.').pop() || 'jpg').toLowerCase();
    const path = `items/${req.params.id}-${Date.now()}.${ext}`;
    const publicUrl = await uploadImage(req.file.buffer, path, req.file.mimetype);

    const result = await pool.query(
      `UPDATE partner_items SET image_url = $1 WHERE id = $2 AND partner_id = $3 RETURNING *`,
      [publicUrl, req.params.id, req.auth.partnerId]
    );
    res.json({ item: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Image upload failed' });
  }
});

// ---- Store status ----

router.put('/store/status', async (req, res) => {
  const { is_active } = req.body;
  if (typeof is_active !== 'boolean') return res.status(400).json({ error: 'is_active must be true or false' });

  const result = await pool.query(
    `UPDATE partners SET is_active = $1 WHERE id = $2 RETURNING *`,
    [is_active, req.auth.partnerId]
  );
  res.json({ partner: result.rows[0] });
});

// ---- Orders management ----

router.get('/orders', async (req, res) => {
  const result = await pool.query(
    `SELECT o.*, u.name AS customer_name, u.phone AS customer_phone
     FROM orders o JOIN users u ON u.id = o.user_id
     WHERE o.partner_id = $1
     ORDER BY o.created_at DESC`,
    [req.auth.partnerId]
  );
  res.json({ orders: result.rows });
});

router.get('/orders/:id', async (req, res) => {
  const orderResult = await pool.query(
    `SELECT o.*, u.name AS customer_name, u.phone AS customer_phone
     FROM orders o JOIN users u ON u.id = o.user_id
     WHERE o.id = $1 AND o.partner_id = $2`,
    [req.params.id, req.auth.partnerId]
  );
  const order = orderResult.rows[0];
  if (!order) return res.status(404).json({ error: 'Order not found' });
  const items = await pool.query(
    `SELECT oi.*, l.title FROM order_items oi JOIN listings l ON l.id = oi.listing_id WHERE oi.order_id = $1`,
    [order.id]
  );
  res.json({ order, items: items.rows });
});

// ---- Reports ----

router.get('/reports', async (req, res) => {
  const partnerId = req.auth.partnerId;

  const totalsResult = await pool.query(
    `SELECT
        COUNT(*)::int AS total_orders,
        COUNT(*) FILTER (WHERE status = 'completed')::int AS completed_orders,
        COUNT(*) FILTER (WHERE status = 'cancelled')::int AS cancelled_orders,
        COUNT(*) FILTER (WHERE status IN ('placed', 'ready'))::int AS active_orders,
        COALESCE(SUM(total_amount) FILTER (WHERE payment_status = 'paid'), 0) AS total_revenue
     FROM orders WHERE partner_id = $1`,
    [partnerId]
  );

  const itemsResult = await pool.query(
    `SELECT COALESCE(SUM(oi.quantity), 0)::int AS total_items_sold
     FROM order_items oi
     JOIN orders o ON o.id = oi.order_id
     WHERE o.partner_id = $1 AND o.payment_status = 'paid'`,
    [partnerId]
  );

  const dailyResult = await pool.query(
    `SELECT date_trunc('day', created_at) AS day,
            COUNT(*)::int AS orders,
            COALESCE(SUM(total_amount) FILTER (WHERE payment_status = 'paid'), 0) AS revenue
     FROM orders
     WHERE partner_id = $1 AND created_at > now() - interval '7 days'
     GROUP BY day ORDER BY day`,
    [partnerId]
  );

  const topListingsResult = await pool.query(
    `SELECT l.id, l.title, SUM(oi.quantity)::int AS quantity_sold,
            SUM(oi.quantity * oi.price_at_purchase) AS revenue
     FROM order_items oi
     JOIN orders o ON o.id = oi.order_id
     JOIN listings l ON l.id = oi.listing_id
     WHERE o.partner_id = $1 AND o.payment_status = 'paid'
     GROUP BY l.id, l.title
     ORDER BY quantity_sold DESC
     LIMIT 5`,
    [partnerId]
  );

  const ratingResult = await pool.query(
    `SELECT ROUND(AVG(rating)::numeric, 2) AS average_rating, COUNT(*)::int AS review_count
     FROM reviews WHERE partner_id = $1`,
    [partnerId]
  );

  res.json({
    ...totalsResult.rows[0],
    ...itemsResult.rows[0],
    ...ratingResult.rows[0],
    dailyBreakdown: dailyResult.rows,
    topListings: topListingsResult.rows
  });
});

router.put('/orders/:id/status', async (req, res) => {
  const { status } = req.body;
  const allowed = ['placed', 'ready', 'completed', 'cancelled'];
  if (!allowed.includes(status)) return res.status(400).json({ error: `status must be one of ${allowed.join(', ')}` });

  const result = await pool.query(
    `UPDATE orders SET status = $1 WHERE id = $2 AND partner_id = $3 RETURNING *`,
    [status, req.params.id, req.auth.partnerId]
  );
  if (!result.rows[0]) return res.status(404).json({ error: 'Order not found' });
  res.json({ order: result.rows[0] });
});

module.exports = router;
