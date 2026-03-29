const express = require('express');

const router = express.Router();

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
 *     summary: Create doctor
 *     tags: [Doctors]
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
 *     summary: List doctors
 *     tags: [Doctors]
 */
router.get('/doctors', (_req, res) => {
  res.json(doctors);
});

/**
 * @openapi
 * /doctors/{id}:
 *   get:
 *     summary: Get doctor by id
 *     tags: [Doctors]
 */
router.get('/doctors/:id', (req, res) => {
  const id = Number(req.params.id);
  const doc = doctors.find((d) => d.id === id);
  if (!doc) return res.status(404).json({ error: 'Doctor not found' });
  return res.json(doc);
});

/**
 * @openapi
 * /doctors/{id}:
 *   patch:
 *     summary: Update doctor
 *     tags: [Doctors]
 */
router.patch('/doctors/:id', (req, res) => {
  const id = Number(req.params.id);
  const doc = doctors.find((d) => d.id === id);
  if (!doc) return res.status(404).json({ error: 'Doctor not found' });
  const { fullName, specialty, licenseNo } = req.body;
  if (fullName === undefined && specialty === undefined && licenseNo === undefined) {
    return res.status(400).json({ error: 'Provide fullName, specialty, and/or licenseNo' });
  }
  if (fullName !== undefined) doc.fullName = fullName;
  if (specialty !== undefined) doc.specialty = specialty;
  if (licenseNo !== undefined) doc.licenseNo = licenseNo;
  return res.json(doc);
});

/**
 * @openapi
 * /doctors/{id}:
 *   put:
 *     summary: Replace doctor (full body)
 *     tags: [Doctors]
 */
router.put('/doctors/:id', (req, res) => {
  const id = Number(req.params.id);
  const doc = doctors.find((d) => d.id === id);
  if (!doc) return res.status(404).json({ error: 'Doctor not found' });
  const { fullName, specialty, licenseNo } = req.body;
  if (!fullName || !specialty) {
    return res.status(400).json({ error: 'fullName and specialty are required' });
  }
  doc.fullName = fullName;
  doc.specialty = specialty;
  doc.licenseNo = licenseNo ?? null;
  return res.json(doc);
});

/**
 * @openapi
 * /doctors/{id}:
 *   delete:
 *     summary: Delete doctor
 *     tags: [Doctors]
 */
router.delete('/doctors/:id', (req, res) => {
  const id = Number(req.params.id);
  const idx = doctors.findIndex((d) => d.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Doctor not found' });
  const [removed] = doctors.splice(idx, 1);
  return res.json({ message: 'Doctor deleted', doctor: removed });
});

module.exports = router;
