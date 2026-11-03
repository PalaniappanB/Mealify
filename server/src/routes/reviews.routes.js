const express = require('express');
const pool = require('../db/pool');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

router.post('/', authRequired('customer'), async (req, res) => {
  const { order_id, rating, comment } = req.body;
  if (!order_id || !rating) return res.status(400).json({ error: 'order_id and rating are required' });
  if (rating < 1 || rating > 5) return res.status(400).json({ error: 'rating must be between 1 and 5' });

  try {
    const orderResult = await pool.query(
      `SELECT * FROM orders WHERE id = $1 AND user_id = $2`,
      [order_id, req.auth.sub]
    );
    const order = orderResult.rows[0];
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.status !== 'completed') {
      return res.status(409).json({ error: 'You can only review a completed order' });
    }

    const result = await pool.query(
      `INSERT INTO reviews (order_id, user_id, partner_id, rating, comment)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [order_id, req.auth.sub, order.partner_id, rating, comment || null]
    );
    res.status(201).json({ review: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'You already reviewed this order' });
    }
    console.error(err);
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

// Public — shown on a partner's detail page.
router.get('/partner/:partnerId', async (req, res) => {
  const reviews = await pool.query(
    `SELECT r.id, r.rating, r.comment, r.created_at, u.name AS customer_name
     FROM reviews r JOIN users u ON u.id = r.user_id
     WHERE r.partner_id = $1
     ORDER BY r.created_at DESC
     LIMIT 50`,
    [req.params.partnerId]
  );
  const summary = await pool.query(
    `SELECT ROUND(AVG(rating)::numeric, 2) AS average_rating, COUNT(*)::int AS review_count
     FROM reviews WHERE partner_id = $1`,
    [req.params.partnerId]
  );
  res.json({ reviews: reviews.rows, ...summary.rows[0] });
});

module.exports = router;
