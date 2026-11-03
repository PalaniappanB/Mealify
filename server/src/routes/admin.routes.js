const express = require('express');
const pool = require('../db/pool');
const { authRequired } = require('../middleware/auth');

const router = express.Router();
router.use(authRequired('admin'));

// Platform-wide snapshot across every partner and customer.
router.get('/overview', async (_req, res) => {
  const totals = await pool.query(
    `SELECT
        COUNT(DISTINCT p.id)::int AS total_partners,
        COUNT(DISTINCT p.id) FILTER (WHERE p.is_active)::int AS active_partners,
        (SELECT COUNT(*) FROM users)::int AS total_customers,
        COUNT(DISTINCT o.id)::int AS total_orders,
        COALESCE(SUM(o.total_amount) FILTER (WHERE o.payment_status = 'paid'), 0) AS total_revenue
     FROM partners p
     LEFT JOIN orders o ON o.partner_id = p.id`
  );

  const bagsResult = await pool.query(
    `SELECT COALESCE(SUM(oi.quantity), 0)::int AS bags_rescued
     FROM order_items oi JOIN orders o ON o.id = oi.order_id
     WHERE o.payment_status = 'paid'`
  );

  const ratingResult = await pool.query(
    `SELECT ROUND(AVG(rating)::numeric, 2) AS average_rating, COUNT(*)::int AS review_count FROM reviews`
  );

  res.json({ ...totals.rows[0], ...bagsResult.rows[0], ...ratingResult.rows[0] });
});

// Per-partner leaderboard — how every restaurant is performing.
router.get('/partners', async (_req, res) => {
  const result = await pool.query(
    `SELECT p.id, p.name, p.city, p.cuisine_type, p.is_active,
            COUNT(DISTINCT o.id)::int AS total_orders,
            COALESCE(SUM(o.total_amount) FILTER (WHERE o.payment_status = 'paid'), 0) AS total_revenue,
            (SELECT ROUND(AVG(r.rating)::numeric, 2) FROM reviews r WHERE r.partner_id = p.id) AS average_rating
     FROM partners p
     LEFT JOIN orders o ON o.partner_id = p.id
     GROUP BY p.id
     ORDER BY total_revenue DESC`
  );
  res.json({ partners: result.rows });
});

// Daily platform-wide revenue/order trend.
router.get('/trends', async (_req, res) => {
  const result = await pool.query(
    `SELECT date_trunc('day', created_at) AS day,
            COUNT(*)::int AS orders,
            COALESCE(SUM(total_amount) FILTER (WHERE payment_status = 'paid'), 0) AS revenue
     FROM orders
     WHERE created_at > now() - interval '14 days'
     GROUP BY day ORDER BY day`
  );
  res.json({ trends: result.rows });
});

// Top-selling dishes and most popular cuisines across every partner.
router.get('/top-items', async (_req, res) => {
  const topItems = await pool.query(
    `SELECT l.title, p.name AS partner_name, SUM(oi.quantity)::int AS quantity_sold
     FROM order_items oi
     JOIN orders o ON o.id = oi.order_id
     JOIN listings l ON l.id = oi.listing_id
     JOIN partners p ON p.id = o.partner_id
     WHERE o.payment_status = 'paid'
     GROUP BY l.id, l.title, p.name
     ORDER BY quantity_sold DESC
     LIMIT 10`
  );

  const cuisinePopularity = await pool.query(
    `SELECT p.cuisine_type, COUNT(DISTINCT o.id)::int AS orders
     FROM orders o JOIN partners p ON p.id = o.partner_id
     WHERE o.payment_status = 'paid'
     GROUP BY p.cuisine_type
     ORDER BY orders DESC`
  );

  res.json({ topItems: topItems.rows, cuisinePopularity: cuisinePopularity.rows });
});

module.exports = router;
