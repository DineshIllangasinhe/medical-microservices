/**
 * OpenAPI / Swagger configuration for Appointment Service.
 */
const swaggerJsdoc = require('swagger-jsdoc');

const PORT = process.env.PORT || 3003;

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Appointment Service API',
      version: '1.0.0',
      description: 'Full CRUD for appointments (demo in-memory storage).',
    },
    servers: [{ url: `http://localhost:${PORT}`, description: 'Appointment service (direct)' }],
  },
  apis: ['./routes/*.js', './server.js'],
};

module.exports = swaggerJsdoc(options);
