/**
 * API Gateway — single entry point for the medical appointment backend.
 * Port: 5000
 *
 * Proxies: Express strips the first path segment; the remainder is forwarded as-is (no pathRewrite).
 *   /users/*        → User service (3001), e.g. /users/users/1 → GET /users/1
 *   /doctors/*      → Doctor service (3002)
 *   /appointments/* → Appointment service (3003)
 *   /payments/*     → Payment service (3004)
 *
 * Example via gateway:
 *   POST http://localhost:5000/users/register
 *   GET  http://localhost:5000/doctors/doctors
 *
 * Swagger UI: GET /api-docs (aggregated gateway paths). Each microservice also has /api-docs on its port.
 */
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const gatewayOpenApi = require('./config/openapi');

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
    swaggerUi: `http://localhost:${PORT}/api-docs`,
    usage: {
      users: 'CRUD: POST /users/register, login, GET /users/profile (JWT), GET /users/users, GET|PATCH|PUT|DELETE /users/users/:id (JWT for patch/put/delete own)',
      doctors: 'CRUD: POST /doctors/doctor or /doctors/doctors, GET /doctors/doctors, GET|PATCH|PUT|DELETE /doctors/doctors/:id',
      appointments: 'CRUD: POST/GET /appointments/appointments, GET|PATCH|PUT|DELETE /appointments/appointments/:id',
      payments: 'CRUD: POST /payments/pay or /payments/payments, GET /payments/payments, GET|PATCH|PUT|DELETE /payments/payments/:id',
    },
    swaggerPerService: 'Each microservice also exposes /api-docs on ports 3001–3004.',
  });
});

/** Gateway-facing OpenAPI — try-it-out hits this host (port 5000) */
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(gatewayOpenApi, { explorer: true }));

/** Shared proxy: changeOrigin only. Do not pathRewrite — v3 middleware uses req.url after mount; rewriting ^/users turned /users/1 into /1 and broke GET /users/users/:id. */
function proxyTo(target) {
  return { target, changeOrigin: true };
}

app.use('/users', createProxyMiddleware(proxyTo(USER_SERVICE)));

app.use('/doctors', createProxyMiddleware(proxyTo(DOCTOR_SERVICE)));

app.use('/appointments', createProxyMiddleware(proxyTo(APPOINTMENT_SERVICE)));

app.use('/payments', createProxyMiddleware(proxyTo(PAYMENT_SERVICE)));

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found', hint: 'See GET / for route map' });
});

app.listen(PORT, () => {
  console.log(`API Gateway listening on http://localhost:${PORT}`);
  console.log(`Swagger UI: http://localhost:${PORT}/api-docs`);
});
