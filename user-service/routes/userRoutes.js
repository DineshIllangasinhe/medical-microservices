const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authMiddleware, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

/** In-memory user store for demonstration */
const users = [];
let idSeq = 1;

/**
 * @openapi
 * /register:
 *   post:
 *     summary: Register a new user (patient)
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, fullName]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 6 }
 *               fullName: { type: string }
 *     responses:
 *       201:
 *         description: User created
 *       409:
 *         description: Email already registered
 */
router.post('/register', async (req, res) => {
  const { email, password, fullName } = req.body;
  if (!email || !password || !fullName) {
    return res.status(400).json({ error: 'email, password, and fullName are required' });
  }
  if (users.some((u) => u.email === email)) {
    return res.status(409).json({ error: 'Email already registered' });
  }
  const hash = await bcrypt.hash(password, 10);
  const user = { id: idSeq++, email, fullName, passwordHash: hash };
  users.push(user);
  return res.status(201).json({
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    message: 'Registration successful',
  });
});

/**
 * @openapi
 * /login:
 *   post:
 *     summary: Log in and receive a JWT
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: JWT issued
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }
  const user = users.find((u) => u.email === email);
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  const token = jwt.sign(
    { sub: user.id, email: user.email, fullName: user.fullName },
    JWT_SECRET,
    { expiresIn: '8h' }
  );
  return res.json({ token, expiresIn: '8h', user: { id: user.id, email: user.email, fullName: user.fullName } });
});

/**
 * @openapi
 * /profile:
 *   get:
 *     summary: Get current user profile (requires JWT)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile
 *       401:
 *         description: Unauthorized
 */
router.get('/profile', authMiddleware, (req, res) => {
  return res.json({
    id: req.user.sub,
    email: req.user.email,
    fullName: req.user.fullName,
  });
});

module.exports = router;
