/**
 * OpenAPI / Swagger configuration for User Service.
 * Served at GET /api-docs via swagger-ui-express in server.js.
 */
const swaggerJsdoc = require('swagger-jsdoc');

const PORT = process.env.PORT || 3001;

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'User Service API',
      version: '1.0.0',
      description:
        'Handles patient/user registration, authentication, and profile retrieval for the online medical appointment system.',
    },
    servers: [{ url: `http://localhost:${PORT}`, description: 'User service (direct)' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  // JSDoc comments with @openapi live next to route handlers
  apis: ['./routes/*.js', './server.js'],
};

module.exports = swaggerJsdoc(options);
