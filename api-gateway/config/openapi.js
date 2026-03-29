/**
 * OpenAPI 3 document for the **public gateway** surface (port 5000).
 * Paths match what clients call; traffic is proxied to microservices.
 */
const PORT = process.env.PORT || 5000;

const spec = {
  openapi: '3.0.3',
  info: {
    title: 'Medical Appointment API — Gateway',
    version: '1.0.0',
    description:
      'Single entry point for User, Doctor, Appointment, and Payment services. ' +
      'Try requests against this server URL; the gateway forwards to backend services.',
  },
  servers: [{ url: `http://localhost:${PORT}`, description: 'API Gateway' }],
  tags: [
    { name: 'Users', description: 'User service (proxied)' },
    { name: 'Doctors', description: 'Doctor service (proxied)' },
    { name: 'Appointments', description: 'Appointment service (proxied)' },
    { name: 'Payments', description: 'Payment service (proxied)' },
  ],
  paths: {
    '/users/register': {
      post: {
        tags: ['Users'],
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password', 'fullName'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 6 },
                  fullName: { type: 'string' },
                  phone: { type: 'string', description: 'Optional' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Created' },
          409: { description: 'Email already registered' },
        },
      },
    },
    '/users/login': {
      post: {
        tags: ['Users'],
        summary: 'Login — returns JWT',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'OK' }, 401: { description: 'Invalid credentials' } },
      },
    },
    '/users/profile': {
      get: {
        tags: ['Users'],
        summary: 'Current user profile',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'OK' }, 401: { description: 'Unauthorized' } },
      },
      patch: {
        tags: ['Users'],
        summary: 'Update profile (returns new JWT)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  fullName: { type: 'string' },
                  phone: { type: 'string', nullable: true },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'OK' }, 400: { description: 'Bad request' }, 401: { description: 'Unauthorized' } },
      },
    },
    '/users/profile/password': {
      patch: {
        tags: ['Users'],
        summary: 'Change password',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['currentPassword', 'newPassword'],
                properties: {
                  currentPassword: { type: 'string' },
                  newPassword: { type: 'string', minLength: 6 },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'OK' }, 401: { description: 'Wrong current password' } },
      },
    },
    '/users/users': {
      get: {
        tags: ['Users'],
        summary: 'List users (demo, no auth)',
        responses: { 200: { description: 'OK' } },
      },
    },
    '/users/users/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Get user by id',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'OK' }, 404: { description: 'Not found' } },
      },
    },
    '/doctors/doctor': {
      post: {
        tags: ['Doctors'],
        summary: 'Create doctor',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['fullName', 'specialty'],
                properties: {
                  fullName: { type: 'string' },
                  specialty: { type: 'string' },
                  licenseNo: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Created' } },
      },
    },
    '/doctors/doctors': {
      get: {
        tags: ['Doctors'],
        summary: 'List doctors',
        responses: { 200: { description: 'OK' } },
      },
    },
    '/doctors/doctors/{id}': {
      get: {
        tags: ['Doctors'],
        summary: 'Get doctor by id',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'OK' }, 404: { description: 'Not found' } },
      },
    },
    '/appointments/appointments': {
      post: {
        tags: ['Appointments'],
        summary: 'Book appointment',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['userId', 'doctorId', 'scheduledAt'],
                properties: {
                  userId: { type: 'integer' },
                  doctorId: { type: 'integer' },
                  scheduledAt: { type: 'string', format: 'date-time' },
                  reason: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Created' } },
      },
      get: {
        tags: ['Appointments'],
        summary: 'List appointments',
        parameters: [
          { in: 'query', name: 'userId', schema: { type: 'integer' } },
          { in: 'query', name: 'doctorId', schema: { type: 'integer' } },
        ],
        responses: { 200: { description: 'OK' } },
      },
    },
    '/appointments/appointments/{id}': {
      delete: {
        tags: ['Appointments'],
        summary: 'Cancel appointment',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'OK' }, 404: { description: 'Not found' } },
      },
    },
    '/payments/pay': {
      post: {
        tags: ['Payments'],
        summary: 'Record payment (demo)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['appointmentId', 'amount', 'currency'],
                properties: {
                  appointmentId: { type: 'integer' },
                  amount: { type: 'number' },
                  currency: { type: 'string', example: 'USD' },
                  method: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Created' } },
      },
    },
    '/payments/payments': {
      get: {
        tags: ['Payments'],
        summary: 'List payments',
        parameters: [{ in: 'query', name: 'appointmentId', schema: { type: 'integer' } }],
        responses: { 200: { description: 'OK' } },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
};

module.exports = spec;
