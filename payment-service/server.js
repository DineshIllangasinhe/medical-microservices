/**
 * Payment Service — Online Medical Appointment System
 * Port: 3004
 *
 * Endpoints (CRUD):
 *   POST   /pay | POST /payments
 *   GET    /payments | GET /payments/:id
 *   PATCH  /payments/:id | PUT /payments/:id | DELETE /payments/:id
 *   GET    /api-docs
 */
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const paymentRoutes = require('./routes/paymentRoutes');

const PORT = process.env.PORT || 3004;
const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ service: 'payment-service', status: 'ok', port: PORT });
});

app.use('/', paymentRoutes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Payment service listening on http://localhost:${PORT}`);
  // eslint-disable-next-line no-console
  console.log(`Swagger UI: http://localhost:${PORT}/api-docs`);
});
