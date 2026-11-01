const express = require('express');
const pool = require('../db/pool');
const { distanceKm } = require('../utils/distance');

const router = express.Router();

// GET /api/listings?lat=&lng=&cuisine=&maxPrice=&city=
router.get('/', async (req, res) => {
  const { lat, lng, cuisine, maxPrice, city } = req.query;
  try {
    const params = [];
    let where = `WHERE l.status = 'active' AND l.quantity_available > 0 AND l.expires_at > now() AND p.is_active = true`;

    if (cuisine) {
      params.push(cuisine);
      where += ` AND p.cuisine_type = $${params.length}`;
    }
    if (maxPrice) {
      params.push(Number(maxPrice));
      where += ` AND l.discounted_price <= $${params.length}`;
    }
    if (city) {
      params.push(city);
      where += ` AND p.city = $${params.length}`;
    }

    const result = await pool.query(
      `SELECT l.*, p.name AS partner_name, p.cuisine_type, p.city, p.logo_url,
              p.latitude AS partner_lat, p.longitude AS partner_lng
       FROM listings l
       JOIN partners p ON p.id = l.partner_id
       ${where}
       ORDER BY l.pickup_window_start`,
      params
    );

    let listings = result.rows.map((l) => ({
      ...l,
      distance_km: lat && lng ? distanceKm(Number(lat), Number(lng), l.partner_lat, l.partner_lng) : null
    }));

    if (lat && lng) listings.sort((a, b) => (a.distance_km ?? 999) - (b.distance_km ?? 999));

    res.json({ listings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT l.*, p.name AS partner_name, p.cuisine_type, p.city, p.logo_url, p.address AS partner_address,
              p.latitude AS partner_lat, p.longitude AS partner_lng
       FROM listings l JOIN partners p ON p.id = l.partner_id
       WHERE l.id = $1`,
      [req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Listing not found' });
    res.json({ listing: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch listing' });
  }
});

module.exports = router;
