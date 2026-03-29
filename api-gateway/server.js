/**
 * API Gateway — single entry point for the medical appointment backend.
 * Port: 5000
 *
 * Proxies (path prefix is stripped before forwarding):
 *   /users        → User service (3001)
 *   /doctors      → Doctor service (3002)
 *   /appointments → Appointment service (3003)
 *   /payments     → Payment service (3004)
 *
 * Example via gateway:
 *   POST http://localhost:5000/users/register
 *   GET  http://localhost:5000/doctors/doctors
 *
 * Swagger UI remains on each microservice at /api-docs (see README).
 */
const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const PORT = process.env.PORT || 5000;

/** Override targets for Docker / remote hosts */
const USER_SERVICE = process.env.USER_SERVICE_URL || 'http://localhost:3001';
const DOCTOR_SERVICE = process.env.DOCTOR_SERVICE_URL || 'http://localhost:3002';
const APPOINTMENT_SERVICE = process.env.APPOINTMENT_SERVICE_URL || 'http://localhost:3003';
const PAYMENT_SERVICE = process.env.PAYMENT_SERVICE_URL || 'http://localhost:3004';

const app = express();

app.use(cors());
/** Do not use express.json() globally — it consumes the body stream and breaks POST proxying. */

app.get('/health', (_req, res) => {
  res.json({
    service: 'api-gateway',
    status: 'ok',
    port: PORT,
    routes: {
      users: `${USER_SERVICE} (via /users/*)`,
      doctors: `${DOCTOR_SERVICE} (via /doctors/*)`,
      appointments: `${APPOINTMENT_SERVICE} (via /appointments/*)`,
      payments: `${PAYMENT_SERVICE} (via /payments/*)`,
    },
  });
});

app.get('/', (_req, res) => {
  res.json({
    message: 'Medical Appointment API Gateway',
    usage: {
      users: 'CRUD: POST /users/register, login, GET /users/profile (JWT), GET /users/users, GET|PATCH|DELETE /users/users/:id (JWT for patch/delete own)',
      doctors: 'CRUD: POST /doctors/doctor, GET /doctors/doctors, GET|PATCH|PUT|DELETE /doctors/doctors/:id',
      appointments: 'CRUD: POST/GET /appointments/appointments, GET|PATCH|PUT|DELETE /appointments/appointments/:id',
      payments: 'CRUD: POST /payments/pay, GET /payments/payments, GET|PATCH|PUT|DELETE /payments/payments/:id',
    },
    swaggerPerService: 'Each microservice exposes /api-docs on its own port (3001–3004).',
  });
});

/**
 * Shared proxy options: strip gateway prefix; body and Authorization pass through untouched.
 */
function proxyOptions(target, pathRewritePattern, pathRewriteReplacement) {
  return {
    target,
    changeOrigin: true,
    pathRewrite: { [pathRewritePattern]: pathRewriteReplacement },
  };
}

app.use('/users', createProxyMiddleware(proxyOptions(USER_SERVICE, '^/users', '')));

app.use('/doctors', createProxyMiddleware(proxyOptions(DOCTOR_SERVICE, '^/doctors', '')));

app.use(
  '/appointments',
  createProxyMiddleware(proxyOptions(APPOINTMENT_SERVICE, '^/appointments', ''))
);

app.use('/payments', createProxyMiddleware(proxyOptions(PAYMENT_SERVICE, '^/payments', '')));

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found', hint: 'See GET / for route map' });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API Gateway listening on http://localhost:${PORT}`);
});
