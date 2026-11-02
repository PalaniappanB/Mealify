const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db/pool');
const { signToken } = require('../utils/jwt');
const { authRequired } = require('../middleware/auth');
const { sendOtpSms, isMocked } = require('../utils/sms');

const router = express.Router();

// In-memory OTP stores (fine for a single-instance dev/demo build). Kept
// separate so a login code can never double as a password-reset code.
const otpStore = new Map(); // phone -> { code, expiresAt }
const passwordResetStore = new Map(); // phone -> { code, expiresAt }

function generateOtpCode() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

router.post('/signup', async (req, res) => {
  const { name, email, phone, password, preferred_language } = req.body;
  if (!name || !password || (!email && !phone)) {
    return res.status(400).json({ error: 'name, password and email or phone are required' });
  }
  try {
    const existing = await pool.query(
      'SELECT id FROM users WHERE email = $1 OR phone = $2',
      [email || null, phone || null]
    );
    if (existing.rows.length) {
      return res.status(409).json({ error: 'An account with this email or phone already exists' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (name, email, phone, password_hash, preferred_language)
       VALUES ($1, $2, $3, $4, COALESCE($5, 'en'))
       RETURNING id, name, email, phone, preferred_language, avatar_url, created_at`,
      [name, email || null, phone || null, passwordHash, preferred_language]
    );
    const user = result.rows[0];
    const token = signToken({ sub: user.id, role: 'customer' });
    res.status(201).json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Signup failed' });
  }
});

router.post('/login', async (req, res) => {
  const { email, phone, password } = req.body;
  if ((!email && !phone) || !password) {
    return res.status(400).json({ error: 'email or phone, and password are required' });
  }
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1 OR phone = $2',
      [email || null, phone || null]
    );
    const user = result.rows[0];
    if (!user || !user.password_hash) {
      return res.status(401).json({ error: 'No account found with that email or phone number' });
    }
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Incorrect password' });

    const token = signToken({ sub: user.id, role: 'customer' });
    delete user.password_hash;
    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Sends a real SMS via MSG91 when configured; otherwise logs a mock code
// server-side and returns it as `devHint` so local dev needs no SMS account.
router.post('/otp/request', async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'phone is required' });
  const code = generateOtpCode();
  otpStore.set(phone, { code, expiresAt: Date.now() + 5 * 60 * 1000 });
  try {
    await sendOtpSms(phone, code);
    res.json({ sent: true, devHint: isMocked ? code : undefined });
  } catch (err) {
    console.error('Failed to send OTP SMS:', err.message);
    res.status(502).json({ error: 'Could not send the verification code. Please try again.' });
  }
});

router.post('/otp/verify', async (req, res) => {
  const { phone, code, name } = req.body;
  if (!phone || !code) return res.status(400).json({ error: 'phone and code are required' });

  const entry = otpStore.get(phone);
  if (!entry || entry.code !== code || entry.expiresAt < Date.now()) {
    return res.status(401).json({ error: 'Invalid or expired code' });
  }
  otpStore.delete(phone);

  try {
    let result = await pool.query('SELECT * FROM users WHERE phone = $1', [phone]);
    let user = result.rows[0];
    if (!user) {
      result = await pool.query(
        `INSERT INTO users (name, phone, preferred_language) VALUES ($1, $2, 'en') RETURNING *`,
        [name || 'Mealify User', phone]
      );
      user = result.rows[0];
    }
    delete user.password_hash;
    const token = signToken({ sub: user.id, role: 'customer' });
    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'OTP verification failed' });
  }
});

router.get('/me', authRequired('customer'), async (req, res) => {
  const result = await pool.query(
    'SELECT id, name, email, phone, preferred_language, avatar_url, created_at FROM users WHERE id = $1',
    [req.auth.sub]
  );
  if (!result.rows[0]) return res.status(404).json({ error: 'User not found' });
  res.json({ user: result.rows[0] });
});

router.put('/me', authRequired('customer'), async (req, res) => {
  const { name, email, phone, preferred_language } = req.body;
  try {
    const result = await pool.query(
      `UPDATE users SET
          name = COALESCE($1, name),
          email = COALESCE($2, email),
          phone = COALESCE($3, phone),
          preferred_language = COALESCE($4, preferred_language)
       WHERE id = $5
       RETURNING id, name, email, phone, preferred_language, avatar_url, created_at`,
      [name, email || null, phone || null, preferred_language, req.auth.sub]
    );
    res.json({ user: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'That email or phone is already in use' });
    }
    console.error(err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// ---- Forgot password (phone OTP) ----

router.post('/password/forgot', async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'phone is required' });

  const existing = await pool.query('SELECT id FROM users WHERE phone = $1', [phone]);
  if (!existing.rows[0]) {
    return res.status(404).json({ error: 'No account found with that phone number' });
  }

  const code = generateOtpCode();
  passwordResetStore.set(phone, { code, expiresAt: Date.now() + 5 * 60 * 1000 });
  try {
    await sendOtpSms(phone, code);
    res.json({ sent: true, devHint: isMocked ? code : undefined });
  } catch (err) {
    console.error('Failed to send password-reset SMS:', err.message);
    res.status(502).json({ error: 'Could not send the verification code. Please try again.' });
  }
});

router.post('/password/reset', async (req, res) => {
  const { phone, code, newPassword } = req.body;
  if (!phone || !code || !newPassword) {
    return res.status(400).json({ error: 'phone, code and newPassword are required' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const entry = passwordResetStore.get(phone);
  if (!entry || entry.code !== code || entry.expiresAt < Date.now()) {
    return res.status(401).json({ error: 'Invalid or expired code' });
  }
  passwordResetStore.delete(phone);

  try {
    const passwordHash = await bcrypt.hash(newPassword, 10);
    const result = await pool.query(
      `UPDATE users SET password_hash = $1 WHERE phone = $2 RETURNING id, name, email, phone`,
      [passwordHash, phone]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'No account found with that phone number' });

    const token = signToken({ sub: result.rows[0].id, role: 'customer' });
    res.json({ token, user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

module.exports = router;
