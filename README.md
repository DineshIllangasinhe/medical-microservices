# Online Medical Appointment System — Microservices Backend

Node.js and Express microservices with an API Gateway (`http-proxy-middleware`). **Swagger UI** is at **`http://localhost:5000/api-docs`** on the gateway (all public paths in one place), and each microservice still exposes `/api-docs` on its own port.

## Project layout

```
medical-microservices/
├── api-gateway/          # Port 5000 — routes to all services
├── user-service/         # Port 3001
├── doctor-service/       # Port 3002
├── appointment-service/  # Port 3003
└── payment-service/      # Port 3004
```

## Prerequisites

- [Node.js](https://nodejs.org/) 18 or newer
- **npm 7+** (workspaces need a single install from the repo root)

## Install dependencies

This repo uses **[npm workspaces](https://docs.npmjs.com/cli/using-npm/workspaces)**. Each service still has its own `package.json`, but you install **once** from the root — dependencies are linked/hoisted and **`package-lock.json` lives only at the root**.

From the repository root:

```powershell
Set-Location c:\Users\avish\Documents\git\medical-microservices
npm install
```

If you previously ran `npm install` inside each folder and hit odd resolution errors, delete old `node_modules` folders (root + each `*-service` / `api-gateway`) and run `npm install` again from the root only.

### Run one service from the root

```powershell
npm run start -w user-service
# or: doctor-service, appointment-service, payment-service, api-gateway
```

## Run everything at once (recommended)

From the **repository root** (folder that contains `user-service`, `api-gateway`, etc.):

```powershell
npm start
```

This uses [concurrently](https://www.npmjs.com/package/concurrently) to run all five processes in **one terminal**. Logs are prefixed with `US`, `DS`, `AS`, `PS`, `GW`. Press `Ctrl+C` once to stop all of them (`-k` kills the rest if one exits).

- **Gateway:** [http://localhost:5000](http://localhost:5000)  
- **Swagger (gateway — recommended for demos):** [http://localhost:5000/api-docs](http://localhost:5000/api-docs)  
- **Swagger per service:** ports `3001`–`3004` at `/api-docs`  

To run only the four microservices (no gateway): `npm run start:services-only`.

## Run each service (independent)

From **repo root** (after `npm install` there), or `cd` into the folder and run `npm start`.

| Service     | From root                         | From service folder | Port |
|-------------|-----------------------------------|----------------------|------|
| User        | `npm run start -w user-service`   | `cd user-service; npm start` | 3001 |
| Doctor      | `npm run start -w doctor-service` | `cd doctor-service; npm start` | 3002 |
| Appointment | `npm run start -w appointment-service` | `cd appointment-service; npm start` | 3003 |
| Payment     | `npm run start -w payment-service` | `cd payment-service; npm start` | 3004 |
| API Gateway | `npm run start -w api-gateway`   | `cd api-gateway; npm start` | 5000 |

### Swagger (gateway + per service)

- **All routes via gateway:** [http://localhost:5000/api-docs](http://localhost:5000/api-docs) (run gateway + backends for Try it out)

Per microservice (direct):

- User: [http://localhost:3001/api-docs](http://localhost:3001/api-docs)
- Doctor: [http://localhost:3002/api-docs](http://localhost:3002/api-docs)
- Appointment: [http://localhost:3003/api-docs](http://localhost:3003/api-docs)
- Payment: [http://localhost:3004/api-docs](http://localhost:3004/api-docs)

## Call APIs through the gateway (port 5000)

The gateway strips the first path segment and forwards to the matching service.

| Gateway URL | Forwards to service path |
|-------------|---------------------------|


Gateway health, route map, and Swagger:

- [http://localhost:5000/health](http://localhost:5000/health)
- [http://localhost:5000/](http://localhost:5000/)
- [http://localhost:5000/api-docs](http://localhost:5000/api-docs)

## Optional: service base URLs (Docker / remote)

```text
USER_SERVICE_URL=http://user:3001
DOCTOR_SERVICE_URL=http://doctor:3002
APPOINTMENT_SERVICE_URL=http://appointment:3003
PAYMENT_SERVICE_URL=http://payment:3004
```

## Demo flow (curl)

```bash
# Register and login via gateway
curl -s -X POST http://localhost:5000/users/register -H "Content-Type: application/json" -d "{\"email\":\"pat@example.com\",\"password\":\"secret12\",\"fullName\":\"Pat Patient\"}"
curl -s -X POST http://localhost:5000/users/login -H "Content-Type: application/json" -d "{\"email\":\"pat@example.com\",\"password\":\"secret12\"}"

# List doctors
curl -s http://localhost:5000/doctors/doctors

# Book appointment (use userId 1 and doctorId 1 after register + seed doctors)
curl -s -X POST http://localhost:5000/appointments/appointments -H "Content-Type: application/json" -d "{\"userId\":1,\"doctorId\":1,\"scheduledAt\":\"2025-04-01T10:00:00.000Z\",\"reason\":\"Checkup\"}"

# Pay for appointment id 1
curl -s -X POST http://localhost:5000/payments/pay -H "Content-Type: application/json" -d "{\"appointmentId\":1,\"amount\":50,\"currency\":\"USD\"}"
```

Replace `TOKEN` from login response for profile:

```bash
curl -s http://localhost:5000/users/profile -H "Authorization: Bearer TOKEN"
curl -s -X PATCH http://localhost:5000/users/profile -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" -d "{\"fullName\":\"Pat P.\",\"phone\":\"+94771234567\"}"
curl -s http://localhost:5000/users/users
```

## Security note

This repo is for **demonstration**. Passwords are hashed with bcrypt; JWT uses a default secret (`JWT_SECRET` env recommended for anything beyond local demos).
