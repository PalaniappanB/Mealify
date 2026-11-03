const express = require('express');
const pool = require('../db/pool');
const { authRequired } = require('../middleware/auth');

const router = express.Router();
router.use(authRequired('customer'));

router.get('/', async (req, res) => {
  const result = await pool.query(
    `SELECT p.*, f.created_at AS favorited_at
     FROM favorites f JOIN partners p ON p.id = f.partner_id
     WHERE f.user_id = $1
     ORDER BY f.created_at DESC`,
    [req.auth.sub]
  );
  res.json({ favorites: result.rows });
});

router.post('/', async (req, res) => {
  const { partner_id } = req.body;
  if (!partner_id) return res.status(400).json({ error: 'partner_id is required' });
  try {
    const result = await pool.query(
      `INSERT INTO favorites (user_id, partner_id) VALUES ($1, $2)
       ON CONFLICT (user_id, partner_id) DO NOTHING RETURNING *`,
      [req.auth.sub, partner_id]
    );
    res.status(201).json({ favorite: result.rows[0] || null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add favorite' });
  }
});

router.delete('/:partnerId', async (req, res) => {
  await pool.query('DELETE FROM favorites WHERE user_id = $1 AND partner_id = $2', [req.auth.sub, req.params.partnerId]);
  res.status(204).end();
});

module.exports = router;
