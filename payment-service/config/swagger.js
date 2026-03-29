/**
 * OpenAPI / Swagger configuration for Payment Service.
 */
const swaggerJsdoc = require('swagger-jsdoc');

const PORT = process.env.PORT || 3004;

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Payment Service API',
      version: '1.0.0',
      description: 'Full CRUD for payment records (demo — no real card processing).',
    },
    servers: [{ url: `http://localhost:${PORT}`, description: 'Payment service (direct)' }],
  },
  apis: ['./routes/*.js', './server.js'],
};

module.exports = swaggerJsdoc(options);
