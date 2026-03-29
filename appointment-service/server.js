/**
 * Appointment Service — Online Medical Appointment System
 * Port: 3003
 *
 * Endpoints (CRUD):
 *   POST   /appointments
 *   GET    /appointments | GET /appointments/:id
 *   PATCH  /appointments/:id | PUT /appointments/:id | DELETE /appointments/:id
 *   GET    /api-docs
 */
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const appointmentRoutes = require('./routes/appointmentRoutes');

const PORT = process.env.PORT || 3003;
const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ service: 'appointment-service', status: 'ok', port: PORT });
});

app.use('/', appointmentRoutes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Appointment service listening on http://localhost:${PORT}`);
  // eslint-disable-next-line no-console
  console.log(`Swagger UI: http://localhost:${PORT}/api-docs`);
});
