/**
 * User Service — Online Medical Appointment System
 * Port: 3001 (override with PORT)
 *
 * Endpoints (CRUD + auth):
 *   POST   /register
 *   POST   /login
 *   GET    /profile (JWT)
 *   GET    /users | GET /users/:id
 *   PATCH  /users/:id | PUT /users/:id | DELETE /users/:id (JWT, own id only)
 *   GET    /api-docs
 */
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const userRoutes = require('./routes/userRoutes');

const PORT = process.env.PORT || 3001;
const app = express();

app.use(cors());
app.use(express.json());

/** Health check for orchestration / demos */
app.get('/health', (_req, res) => {
  res.json({ service: 'user-service', status: 'ok', port: PORT });
});

app.use('/', userRoutes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`User service listening on http://localhost:${PORT}`);
  // eslint-disable-next-line no-console
  console.log(`Swagger UI: http://localhost:${PORT}/api-docs`);
});
