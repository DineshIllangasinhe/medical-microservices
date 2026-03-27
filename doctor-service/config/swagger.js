/**
 * OpenAPI / Swagger configuration for Doctor Service.
 */
const swaggerJsdoc = require('swagger-jsdoc');

const PORT = process.env.PORT || 3002;

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Doctor Service API',
      version: '1.0.0',
      description: 'CRUD-style operations for doctor records used when booking appointments.',
    },
    servers: [{ url: `http://localhost:${PORT}`, description: 'Doctor service (direct)' }],
  },
  apis: ['./routes/*.js', './server.js'],
};

module.exports = swaggerJsdoc(options);
