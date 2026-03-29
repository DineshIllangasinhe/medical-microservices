/**
 * Doctor Service — Online Medical Appointment System
 * Port: 3002
 *
 * Endpoints (CRUD):
 *   POST   /doctor | POST /doctors
 *   GET    /doctors | GET /doctors/:id
 *   PATCH  /doctors/:id | PUT /doctors/:id | DELETE /doctors/:id
 *   GET    /api-docs
 */
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const doctorRoutes = require('./routes/doctorRoutes');

const PORT = process.env.PORT || 3002;
const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ service: 'doctor-service', status: 'ok', port: PORT });
});

app.use('/', doctorRoutes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Doctor service listening on http://localhost:${PORT}`);
  // eslint-disable-next-line no-console
  console.log(`Swagger UI: http://localhost:${PORT}/api-docs`);
});
