const jwt = require('jsonwebtoken');

/** Demo secret — use env in production */
const JWT_SECRET = process.env.JWT_SECRET || 'medical-demo-jwt-secret-change-me';

/**
 * Verifies Bearer JWT and attaches decoded payload to req.user.
 */
function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }
  const token = header.slice(7);
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = { authMiddleware, JWT_SECRET };
