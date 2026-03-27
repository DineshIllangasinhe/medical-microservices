const express = require('express');

const router = express.Router();

/** Sample doctors for demonstration */
const doctors = [
  {
    id: 1,
    fullName: 'Dr. Sarah Chen',
    specialty: 'General Practice',
    licenseNo: 'GP-10001',
  },
  {
    id: 2,
    fullName: 'Dr. James Okonkwo',
    specialty: 'Cardiology',
    licenseNo: 'CD-20042',
  },
];
let idSeq = doctors.length + 1;

/**
 * @openapi
 * /doctor:
 *   post:
 *     summary: Add a new doctor
 *     tags: [Doctors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fullName, specialty]
 *             properties:
 *               fullName: { type: string }
 *               specialty: { type: string }
 *               licenseNo: { type: string }
 *     responses:
 *       201:
 *         description: Doctor created
 */
router.post('/doctor', (req, res) => {
  const { fullName, specialty, licenseNo } = req.body;
  if (!fullName || !specialty) {
    return res.status(400).json({ error: 'fullName and specialty are required' });
  }
  const doc = { id: idSeq++, fullName, specialty, licenseNo: licenseNo || null };
  doctors.push(doc);
  return res.status(201).json(doc);
});

/**
 * @openapi
 * /doctors:
 *   get:
 *     summary: List all doctors
 *     tags: [Doctors]
 *     responses:
 *       200:
 *         description: Array of doctors
 */
router.get('/doctors', (_req, res) => {
  res.json(doctors);
});

/**
 * @openapi
 * /doctors/{id}:
 *   get:
 *     summary: Get doctor by ID
 *     tags: [Doctors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Doctor found
 *       404:
 *         description: Not found
 */
router.get('/doctors/:id', (req, res) => {
  const id = Number(req.params.id);
  const doc = doctors.find((d) => d.id === id);
  if (!doc) {
    return res.status(404).json({ error: 'Doctor not found' });
  }
  return res.json(doc);
});

module.exports = router;
