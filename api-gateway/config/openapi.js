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
        description:
          '**Authentication required.** Call **POST /users/login** first, then send the returned `token` as ' +
          '`Authorization: Bearer <token>`. In Swagger UI, use **Authorize** → bearerAuth and paste the token only (no `Bearer ` prefix).',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'OK' },
          401: { description: 'Missing/invalid `Authorization` header or expired token' },
        },
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
      patch: {
        tags: ['Users'],
        summary: 'Partial update (JWT; own id only)',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  fullName: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'OK' },
          400: { description: 'Bad request' },
          403: { description: 'Forbidden' },
          404: { description: 'Not found' },
          409: { description: 'Email in use' },
        },
      },
      put: {
        tags: ['Users'],
        summary: 'Replace fullName and email (JWT; own id only)',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['fullName', 'email'],
                properties: {
                  fullName: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'OK' },
          400: { description: 'Bad request' },
          403: { description: 'Forbidden' },
          404: { description: 'Not found' },
          409: { description: 'Email in use' },
        },
      },
      delete: {
        tags: ['Users'],
        summary: 'Delete user (JWT; own id only)',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'OK' },
          403: { description: 'Forbidden' },
          404: { description: 'Not found' },
        },
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
      post: {
        tags: ['Doctors'],
        summary: 'Create doctor (same as POST /doctors/doctor)',
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
        responses: { 201: { description: 'Created' }, 400: { description: 'Bad request' } },
      },
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
      patch: {
        tags: ['Doctors'],
        summary: 'Partial update doctor',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  fullName: { type: 'string' },
                  specialty: { type: 'string' },
                  licenseNo: { type: 'string', nullable: true },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'OK' }, 400: { description: 'Bad request' }, 404: { description: 'Not found' } },
      },
      put: {
        tags: ['Doctors'],
        summary: 'Replace doctor',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
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
                  licenseNo: { type: 'string', nullable: true },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'OK' }, 400: { description: 'Bad request' }, 404: { description: 'Not found' } },
      },
      delete: {
        tags: ['Doctors'],
        summary: 'Delete doctor',
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
      get: {
        tags: ['Appointments'],
        summary: 'Get appointment by id',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'OK' }, 404: { description: 'Not found' } },
      },
      patch: {
        tags: ['Appointments'],
        summary: 'Partial update appointment',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  userId: { type: 'integer' },
                  doctorId: { type: 'integer' },
                  scheduledAt: { type: 'string', format: 'date-time' },
                  reason: { type: 'string', nullable: true },
                  status: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'OK' }, 400: { description: 'Bad request' }, 404: { description: 'Not found' } },
      },
      put: {
        tags: ['Appointments'],
        summary: 'Replace appointment',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
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
                  reason: { type: 'string', nullable: true },
                  status: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'OK' }, 400: { description: 'Bad request' }, 404: { description: 'Not found' } },
      },
      delete: {
        tags: ['Appointments'],
        summary: 'Delete appointment',
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
      post: {
        tags: ['Payments'],
        summary: 'Create payment (same as POST /payments/pay)',
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
        responses: { 201: { description: 'Created' }, 400: { description: 'Bad request' } },
      },
      get: {
        tags: ['Payments'],
        summary: 'List payments',
        parameters: [{ in: 'query', name: 'appointmentId', schema: { type: 'integer' } }],
        responses: { 200: { description: 'OK' } },
      },
    },
    '/payments/payments/{id}': {
      get: {
        tags: ['Payments'],
        summary: 'Get payment by id',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'OK' }, 404: { description: 'Not found' } },
      },
      patch: {
        tags: ['Payments'],
        summary: 'Partial update payment',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  amount: { type: 'number' },
                  currency: { type: 'string' },
                  method: { type: 'string' },
                  status: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'OK' }, 400: { description: 'Bad request' }, 404: { description: 'Not found' } },
      },
      put: {
        tags: ['Payments'],
        summary: 'Replace payment',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
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
                  currency: { type: 'string' },
                  method: { type: 'string' },
                  status: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'OK' }, 400: { description: 'Bad request' }, 404: { description: 'Not found' } },
      },
      delete: {
        tags: ['Payments'],
        summary: 'Delete payment',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'OK' }, 404: { description: 'Not found' } },
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
