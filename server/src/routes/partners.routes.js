const express = require('express');
const pool = require('../db/pool');
const { distanceKm } = require('../utils/distance');

const router = express.Router();

// GET /api/partners?lat=&lng=&cuisine=
router.get('/', async (req, res) => {
  const { lat, lng, cuisine } = req.query;
  try {
    const params = [];
    let where = 'WHERE p.is_active = true';
    if (cuisine) {
      params.push(cuisine);
      where += ` AND p.cuisine_type = $${params.length}`;
    }
    const result = await pool.query(
      `SELECT p.*, COUNT(l.id) FILTER (WHERE l.status = 'active' AND l.quantity_available > 0) AS active_listing_count,
              MIN(l.discounted_price) FILTER (WHERE l.status = 'active' AND l.quantity_available > 0) AS min_price
       FROM partners p
       LEFT JOIN listings l ON l.partner_id = p.id
       ${where}
       GROUP BY p.id
       ORDER BY p.name`,
      params
    );

    const partners = result.rows.map((p) => ({
      ...p,
      distance_km: lat && lng ? distanceKm(Number(lat), Number(lng), p.latitude, p.longitude) : null
    }));

    if (lat && lng) partners.sort((a, b) => (a.distance_km ?? 999) - (b.distance_km ?? 999));

    res.json({ partners });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch partners' });
  }
});

router.get('/cuisines', async (_req, res) => {
  const result = await pool.query(
    'SELECT DISTINCT cuisine_type FROM partners WHERE is_active = true ORDER BY cuisine_type'
  );
  res.json({ cuisines: result.rows.map((r) => r.cuisine_type) });
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const { lat, lng } = req.query;
  try {
    const partnerResult = await pool.query('SELECT * FROM partners WHERE id = $1', [id]);
    const partner = partnerResult.rows[0];
    if (!partner) return res.status(404).json({ error: 'Partner not found' });

    const listingsResult = await pool.query(
      `SELECT * FROM listings
       WHERE partner_id = $1 AND status = 'active' AND expires_at > now()
       ORDER BY pickup_window_start`,
      [id]
    );

    res.json({
      partner: {
        ...partner,
        distance_km: lat && lng ? distanceKm(Number(lat), Number(lng), partner.latitude, partner.longitude) : null
      },
      listings: listingsResult.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch partner' });
  }
});

module.exports = router;
