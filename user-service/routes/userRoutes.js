const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authMiddleware, JWT_SECRET } = require('../middleware/auth');
const { toPublicUser } = require('../utils/publicUser');

const router = express.Router();

const users = [];
let idSeq = 1;

function findById(id) {
  return users.find((u) => u.id === Number(id));
}

function signToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, fullName: user.fullName },
    JWT_SECRET,
    { expiresIn: '8h' }
  );
}

/**
 * @openapi
 * /register:
 *   post:
 *     summary: Create user (register)
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, fullName]
 *             properties:
 *               email: { type: string }
 *               password: { type: string, minLength: 6 }
 *               fullName: { type: string }
 *     responses:
 *       201: { description: Created }
 *       409: { description: Email taken }
 */
router.post('/register', async (req, res) => {
  const { email, password, fullName } = req.body;
  if (!email || !password || !fullName) {
    return res.status(400).json({ error: 'email, password, and fullName are required' });
  }
  if (String(password).length < 6) {
    return res.status(400).json({ error: 'password must be at least 6 characters' });
  }
  const normalized = String(email).trim().toLowerCase();
  if (users.some((u) => u.email === normalized)) {
    return res.status(409).json({ error: 'Email already registered' });
  }
  const hash = await bcrypt.hash(password, 10);
  const user = {
    id: idSeq++,
    email: normalized,
    fullName: String(fullName).trim(),
    passwordHash: hash,
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  return res.status(201).json({ ...toPublicUser(user), message: 'Registration successful' });
});

/**
 * @openapi
 * /login:
 *   post:
 *     summary: Login (read token)
 *     tags: [Users]
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }
  const normalized = String(email).trim().toLowerCase();
  const user = users.find((u) => u.email === normalized);
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  return res.json({
    token: signToken(user),
    expiresIn: '8h',
    user: toPublicUser(user),
  });
});

/**
 * @openapi
 * /profile:
 *   get:
 *     summary: Current user (JWT required)
 *     description: Send Authorization Bearer token from POST /login. Without it, returns 401.
 *     tags: [Users]
 *     security: [ { bearerAuth: [] } ]
 */
router.get('/profile', authMiddleware, (req, res) => {
  const user = findById(Number(req.user.sub));
  if (!user) return res.status(404).json({ error: 'User not found' });
  return res.json(toPublicUser(user));
});

/**
 * @openapi
 * /users:
 *   get:
 *     summary: List all users (demo)
 *     tags: [Users]
 */
router.get('/users', (_req, res) => {
  res.json(users.map((u) => toPublicUser(u)));
});

/**
 * @openapi
 * /users/{id}:
 *   get:
 *     summary: Get user by id
 *     tags: [Users]
 */
router.get('/users/:id', (req, res) => {
  const user = findById(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  return res.json(toPublicUser(user));
});

/**
 * @openapi
 * /users/{id}:
 *   patch:
 *     summary: Update user (JWT must match id — demo ownership)
 *     tags: [Users]
 *     security: [ { bearerAuth: [] } ]
 */
router.patch('/users/:id', authMiddleware, async (req, res) => {
  const id = Number(req.params.id);
  if (Number(req.user.sub) !== id) {
    return res.status(403).json({ error: 'You can only update your own account' });
  }
  const user = findById(id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { fullName, email } = req.body;
  if (fullName === undefined && email === undefined) {
    return res.status(400).json({ error: 'Provide fullName and/or email' });
  }
  if (fullName !== undefined) {
    const n = String(fullName).trim();
    if (!n) return res.status(400).json({ error: 'fullName cannot be empty' });
    user.fullName = n;
  }
  if (email !== undefined) {
    const next = String(email).trim().toLowerCase();
    if (users.some((u) => u.email === next && u.id !== id)) {
      return res.status(409).json({ error: 'Email already in use' });
    }
    user.email = next;
  }
  return res.json({
    user: toPublicUser(user),
    token: signToken(user),
    expiresIn: '8h',
    message: 'User updated',
  });
});

/**
 * @openapi
 * /users/{id}:
 *   put:
 *     summary: Replace user fields (JWT must match id)
 *     tags: [Users]
 *     security: [ { bearerAuth: [] } ]
 */
router.put('/users/:id', authMiddleware, async (req, res) => {
  const id = Number(req.params.id);
  if (Number(req.user.sub) !== id) {
    return res.status(403).json({ error: 'You can only update your own account' });
  }
  const user = findById(id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { fullName, email } = req.body;
  if (!fullName || !email) {
    return res.status(400).json({ error: 'fullName and email are required' });
  }
  const n = String(fullName).trim();
  if (!n) return res.status(400).json({ error: 'fullName cannot be empty' });
  const next = String(email).trim().toLowerCase();
  if (users.some((u) => u.email === next && u.id !== id)) {
    return res.status(409).json({ error: 'Email already in use' });
  }
  user.fullName = n;
  user.email = next;
  return res.json({
    user: toPublicUser(user),
    token: signToken(user),
    expiresIn: '8h',
    message: 'User updated',
  });
});

/**
 * @openapi
 * /users/{id}:
 *   delete:
 *     summary: Delete user (JWT must match id)
 *     tags: [Users]
 *     security: [ { bearerAuth: [] } ]
 */
router.delete('/users/:id', authMiddleware, (req, res) => {
  const id = Number(req.params.id);
  if (Number(req.user.sub) !== id) {
    return res.status(403).json({ error: 'You can only delete your own account' });
  }
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return res.status(404).json({ error: 'User not found' });
  const [removed] = users.splice(idx, 1);
  return res.json({ message: 'User deleted', user: toPublicUser(removed) });
});

module.exports = router;
