const express = require('express');

const router = express.Router();

const appointments = [];
let idSeq = 1;

/**
 * @openapi
 * /appointments:
 *   post:
 *     summary: Create appointment
 *     tags: [Appointments]
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
 *     summary: List appointments
 *     tags: [Appointments]
 */
router.get('/appointments', (req, res) => {
  const { userId, doctorId } = req.query;
  let list = appointments;
  if (userId != null) list = list.filter((a) => a.userId === Number(userId));
  if (doctorId != null) list = list.filter((a) => a.doctorId === Number(doctorId));
  res.json(list);
});

/**
 * @openapi
 * /appointments/{id}:
 *   get:
 *     summary: Get appointment by id
 *     tags: [Appointments]
 */
router.get('/appointments/:id', (req, res) => {
  const id = Number(req.params.id);
  const appt = appointments.find((a) => a.id === id);
  if (!appt) return res.status(404).json({ error: 'Appointment not found' });
  return res.json(appt);
});

/**
 * @openapi
 * /appointments/{id}:
 *   patch:
 *     summary: Update appointment (reschedule, reason, status)
 *     tags: [Appointments]
 */
router.patch('/appointments/:id', (req, res) => {
  const id = Number(req.params.id);
  const appt = appointments.find((a) => a.id === id);
  if (!appt) return res.status(404).json({ error: 'Appointment not found' });
  const { userId, doctorId, scheduledAt, reason, status } = req.body;
  if (
    userId === undefined &&
    doctorId === undefined &&
    scheduledAt === undefined &&
    reason === undefined &&
    status === undefined
  ) {
    return res.status(400).json({ error: 'Provide at least one field to update' });
  }
  if (userId !== undefined) appt.userId = Number(userId);
  if (doctorId !== undefined) appt.doctorId = Number(doctorId);
  if (scheduledAt !== undefined) appt.scheduledAt = scheduledAt;
  if (reason !== undefined) appt.reason = reason;
  if (status !== undefined) appt.status = String(status);
  appt.updatedAt = new Date().toISOString();
  return res.json(appt);
});

/**
 * @openapi
 * /appointments/{id}:
 *   put:
 *     summary: Replace appointment
 *     tags: [Appointments]
 */
router.put('/appointments/:id', (req, res) => {
  const id = Number(req.params.id);
  const appt = appointments.find((a) => a.id === id);
  if (!appt) return res.status(404).json({ error: 'Appointment not found' });
  const { userId, doctorId, scheduledAt, reason, status } = req.body;
  if (userId == null || doctorId == null || !scheduledAt) {
    return res.status(400).json({ error: 'userId, doctorId, and scheduledAt are required' });
  }
  appt.userId = Number(userId);
  appt.doctorId = Number(doctorId);
  appt.scheduledAt = scheduledAt;
  appt.reason = reason ?? null;
  appt.status = status != null ? String(status) : 'scheduled';
  appt.updatedAt = new Date().toISOString();
  return res.json(appt);
});

/**
 * @openapi
 * /appointments/{id}:
 *   delete:
 *     summary: Delete appointment
 *     tags: [Appointments]
 */
router.delete('/appointments/:id', (req, res) => {
  const id = Number(req.params.id);
  const idx = appointments.findIndex((a) => a.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Appointment not found' });
  const [removed] = appointments.splice(idx, 1);
  return res.json({ message: 'Appointment deleted', appointment: removed });
});

module.exports = router;
