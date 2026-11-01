const express = require('express');
const pool = require('../db/pool');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

// Mocked payment provider. Structured so a real gateway (e.g. Razorpay) could be
// swapped in later: create an order-side charge, record it, and flip payment_status.
router.post('/mock-charge', authRequired('customer'), async (req, res) => {
  const { orderId } = req.body;
  if (!orderId) return res.status(400).json({ error: 'orderId is required' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const orderResult = await client.query(
      `SELECT * FROM orders WHERE id = $1 AND user_id = $2 FOR UPDATE`,
      [orderId, req.auth.sub]
    );
    const order = orderResult.rows[0];
    if (!order) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Order not found' });
    }
    if (order.payment_status === 'paid') {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'Order already paid' });
    }

    const providerPaymentId = `mock_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
    const paymentResult = await client.query(
      `INSERT INTO payments (order_id, provider, provider_payment_id, amount, status)
       VALUES ($1, 'mock', $2, $3, 'success') RETURNING *`,
      [order.id, providerPaymentId, order.total_amount]
    );

    const updatedOrder = await client.query(
      `UPDATE orders SET payment_status = 'paid' WHERE id = $1 RETURNING *`,
      [order.id]
    );

    await client.query('COMMIT');
    res.json({ payment: paymentResult.rows[0], order: updatedOrder.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Payment failed' });
  } finally {
    client.release();
  }
});

module.exports = router;
