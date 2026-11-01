const express = require('express');
const pool = require('../db/pool');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

router.get('/', authRequired('customer'), async (req, res) => {
  const result = await pool.query(
    'SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, id',
    [req.auth.sub]
  );
  res.json({ addresses: result.rows });
});

router.post('/', authRequired('customer'), async (req, res) => {
  const { label, address_text, latitude, longitude, is_default } = req.body;
  if (!label || !address_text || latitude === undefined || longitude === undefined) {
    return res.status(400).json({ error: 'label, address_text, latitude and longitude are required' });
  }
  if (is_default) {
    await pool.query('UPDATE addresses SET is_default = false WHERE user_id = $1', [req.auth.sub]);
  }
  const result = await pool.query(
    `INSERT INTO addresses (user_id, label, address_text, latitude, longitude, is_default)
     VALUES ($1, $2, $3, $4, $5, COALESCE($6, false)) RETURNING *`,
    [req.auth.sub, label, address_text, latitude, longitude, is_default]
  );
  res.status(201).json({ address: result.rows[0] });
});

router.delete('/:id', authRequired('customer'), async (req, res) => {
  await pool.query('DELETE FROM addresses WHERE id = $1 AND user_id = $2', [req.params.id, req.auth.sub]);
  res.status(204).end();
});

module.exports = router;
