const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db/pool');
const { signToken } = require('../utils/jwt');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

// No public signup — admin accounts are created directly (seed script or DB),
// matching how an internal/ops-only role should be provisioned.
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password are required' });

  try {
    const result = await pool.query('SELECT * FROM admins WHERE email = $1', [email]);
    const admin = result.rows[0];
    if (!admin) return res.status(401).json({ error: 'No admin account found with that email' });

    const valid = await bcrypt.compare(password, admin.password_hash);
    if (!valid) return res.status(401).json({ error: 'Incorrect password' });

    const token = signToken({ sub: admin.id, role: 'admin' });
    delete admin.password_hash;
    res.json({ token, admin });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/me', authRequired('admin'), async (req, res) => {
  const result = await pool.query('SELECT id, name, email, created_at FROM admins WHERE id = $1', [req.auth.sub]);
  if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
  res.json({ admin: result.rows[0] });
});

module.exports = router;
