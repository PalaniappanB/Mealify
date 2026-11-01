const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db/pool');
const { signToken } = require('../utils/jwt');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password are required' });

  try {
    const result = await pool.query(
      `SELECT ps.*, p.name AS partner_name FROM partner_staff ps
       JOIN partners p ON p.id = ps.partner_id
       WHERE ps.email = $1`,
      [email]
    );
    const staff = result.rows[0];
    if (!staff) return res.status(401).json({ error: 'No partner account found with that email' });

    const valid = await bcrypt.compare(password, staff.password_hash);
    if (!valid) return res.status(401).json({ error: 'Incorrect password' });

    const token = signToken({ sub: staff.id, role: 'partner_staff', partnerId: staff.partner_id });
    delete staff.password_hash;
    res.json({ token, staff });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/signup', async (req, res) => {
  const { storeName, cuisineType, address, city, latitude, longitude, staffName, email, password } = req.body;
  if (!storeName || !cuisineType || !address || !city || !staffName || !email || !password) {
    return res.status(400).json({ error: 'All store and account fields are required' });
  }
  if (latitude === undefined || longitude === undefined) {
    return res.status(400).json({ error: 'Store location (latitude/longitude) is required' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const existing = await client.query('SELECT id FROM partner_staff WHERE email = $1', [email]);
    if (existing.rows[0]) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const partnerResult = await client.query(
      `INSERT INTO partners (name, cuisine_type, address, city, latitude, longitude, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, true) RETURNING *`,
      [storeName, cuisineType, address, city, latitude, longitude]
    );
    const partner = partnerResult.rows[0];

    const passwordHash = await bcrypt.hash(password, 10);
    const staffResult = await client.query(
      `INSERT INTO partner_staff (partner_id, name, email, password_hash) VALUES ($1, $2, $3, $4) RETURNING *`,
      [partner.id, staffName, email, passwordHash]
    );
    const staff = staffResult.rows[0];

    await client.query('COMMIT');

    const token = signToken({ sub: staff.id, role: 'partner_staff', partnerId: partner.id });
    delete staff.password_hash;
    res.status(201).json({ token, staff: { ...staff, partner_name: partner.name, city: partner.city, cuisine_type: partner.cuisine_type } });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Signup failed' });
  } finally {
    client.release();
  }
});

router.get('/me', authRequired('partner_staff'), async (req, res) => {
  const result = await pool.query(
    `SELECT ps.id, ps.name, ps.email, ps.partner_id, p.name AS partner_name, p.city, p.cuisine_type, p.logo_url
     FROM partner_staff ps JOIN partners p ON p.id = ps.partner_id
     WHERE ps.id = $1`,
    [req.auth.sub]
  );
  if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
  res.json({ staff: result.rows[0] });
});

module.exports = router;
