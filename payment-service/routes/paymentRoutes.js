const express = require('express');

const router = express.Router();

const payments = [];
let idSeq = 1;

/**
 * @openapi
 * /pay:
 *   post:
 *     summary: Record a payment (demo — always succeeds)
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [appointmentId, amount, currency]
 *             properties:
 *               appointmentId: { type: integer }
 *               amount: { type: number }
 *               currency: { type: string, example: USD }
 *               method: { type: string, example: card }
 *     responses:
 *       201:
 *         description: Payment recorded
 */
router.post('/pay', (req, res) => {
  const { appointmentId, amount, currency, method } = req.body;
  if (appointmentId == null || amount == null || !currency) {
    return res.status(400).json({ error: 'appointmentId, amount, and currency are required' });
  }
  const payment = {
    id: idSeq++,
    appointmentId: Number(appointmentId),
    amount: Number(amount),
    currency: String(currency).toUpperCase(),
    method: method || 'card',
    status: 'completed',
    paidAt: new Date().toISOString(),
  };
  payments.push(payment);
  return res.status(201).json(payment);
});

/**
 * @openapi
 * /payments:
 *   get:
 *     summary: List all recorded payments
 *     tags: [Payments]
 *     parameters:
 *       - in: query
 *         name: appointmentId
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: List of payments
 */
router.get('/payments', (req, res) => {
  const { appointmentId } = req.query;
  if (appointmentId != null) {
    const aid = Number(appointmentId);
    return res.json(payments.filter((p) => p.appointmentId === aid));
  }
  res.json(payments);
});

module.exports = router;
