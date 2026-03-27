const express = require('express');

const router = express.Router();

/** In-memory appointments */
const appointments = [];
let idSeq = 1;

/**
 * @openapi
 * /appointments:
 *   post:
 *     summary: Book a new appointment
 *     tags: [Appointments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, doctorId, scheduledAt]
 *             properties:
 *               userId: { type: integer }
 *               doctorId: { type: integer }
 *               scheduledAt: { type: string, format: date-time, description: ISO 8601 }
 *               reason: { type: string }
 *     responses:
 *       201:
 *         description: Appointment created
 */
router.post('/appointments', (req, res) => {
  const { userId, doctorId, scheduledAt, reason } = req.body;
  if (userId == null || doctorId == null || !scheduledAt) {
    return res.status(400).json({ error: 'userId, doctorId, and scheduledAt are required' });
  }
  const appt = {
    id: idSeq++,
    userId: Number(userId),
    doctorId: Number(doctorId),
    scheduledAt,
    reason: reason || null,
    status: 'scheduled',
    createdAt: new Date().toISOString(),
  };
  appointments.push(appt);
  return res.status(201).json(appt);
});

/**
 * @openapi
 * /appointments:
 *   get:
 *     summary: List appointments (optional filters)
 *     tags: [Appointments]
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema: { type: integer }
 *       - in: query
 *         name: doctorId
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: List of appointments
 */
router.get('/appointments', (req, res) => {
  const { userId, doctorId } = req.query;
  let list = appointments;
  if (userId != null) {
    const uid = Number(userId);
    list = list.filter((a) => a.userId === uid);
  }
  if (doctorId != null) {
    const did = Number(doctorId);
    list = list.filter((a) => a.doctorId === did);
  }
  res.json(list);
});

/**
 * @openapi
 * /appointments/{id}:
 *   delete:
 *     summary: Cancel / remove an appointment
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Deleted
 *       404:
 *         description: Not found
 */
router.delete('/appointments/:id', (req, res) => {
  const id = Number(req.params.id);
  const idx = appointments.findIndex((a) => a.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Appointment not found' });
  }
  const [removed] = appointments.splice(idx, 1);
  return res.json({ message: 'Appointment cancelled', appointment: removed });
});

module.exports = router;
