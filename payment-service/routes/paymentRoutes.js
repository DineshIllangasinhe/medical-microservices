const express = require('express');

const router = express.Router();

const payments = [];
let idSeq = 1;

/**
 * @openapi
 * /pay:
 *   post:
 *     summary: Create payment record
 *     tags: [Payments]
 */
function createPayment(req, res) {
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
}

router.post('/pay', createPayment);

/**
 * @openapi
 * /payments:
 *   post:
 *     summary: Create payment (same as POST /pay)
 *     tags: [Payments]
 */
router.post('/payments', createPayment);

/**
 * @openapi
 * /payments:
 *   get:
 *     summary: List payments
 *     tags: [Payments]
 */
router.get('/payments', (req, res) => {
  const { appointmentId } = req.query;
  if (appointmentId != null) {
    const aid = Number(appointmentId);
    return res.json(payments.filter((p) => p.appointmentId === aid));
  }
  res.json(payments);
});

/**
 * @openapi
 * /payments/{id}:
 *   get:
 *     summary: Get payment by id
 *     tags: [Payments]
 */
router.get('/payments/:id', (req, res) => {
  const id = Number(req.params.id);
  const p = payments.find((x) => x.id === id);
  if (!p) return res.status(404).json({ error: 'Payment not found' });
  return res.json(p);
});

/**
 * @openapi
 * /payments/{id}:
 *   patch:
 *     summary: Update payment (status, amount, method — demo)
 *     tags: [Payments]
 */
router.patch('/payments/:id', (req, res) => {
  const id = Number(req.params.id);
  const p = payments.find((x) => x.id === id);
  if (!p) return res.status(404).json({ error: 'Payment not found' });
  const { amount, currency, method, status } = req.body;
  if (amount === undefined && currency === undefined && method === undefined && status === undefined) {
    return res.status(400).json({ error: 'Provide at least one field to update' });
  }
  if (amount !== undefined) p.amount = Number(amount);
  if (currency !== undefined) p.currency = String(currency).toUpperCase();
  if (method !== undefined) p.method = method;
  if (status !== undefined) p.status = String(status);
  p.updatedAt = new Date().toISOString();
  return res.json(p);
});

/**
 * @openapi
 * /payments/{id}:
 *   put:
 *     summary: Replace payment record
 *     tags: [Payments]
 */
router.put('/payments/:id', (req, res) => {
  const id = Number(req.params.id);
  const p = payments.find((x) => x.id === id);
  if (!p) return res.status(404).json({ error: 'Payment not found' });
  const { appointmentId, amount, currency, method, status } = req.body;
  if (appointmentId == null || amount == null || !currency) {
    return res.status(400).json({ error: 'appointmentId, amount, and currency are required' });
  }
  p.appointmentId = Number(appointmentId);
  p.amount = Number(amount);
  p.currency = String(currency).toUpperCase();
  p.method = method || 'card';
  p.status = status != null ? String(status) : 'completed';
  p.updatedAt = new Date().toISOString();
  return res.json(p);
});

/**
 * @openapi
 * /payments/{id}:
 *   delete:
 *     summary: Delete payment
 *     tags: [Payments]
 */
router.delete('/payments/:id', (req, res) => {
  const id = Number(req.params.id);
  const idx = payments.findIndex((x) => x.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Payment not found' });
  const [removed] = payments.splice(idx, 1);
  return res.json({ message: 'Payment deleted', payment: removed });
});

module.exports = router;
