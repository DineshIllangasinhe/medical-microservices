# Online Medical Appointment System — Microservices Backend

Node.js and Express microservices with an API Gateway (`http-proxy-middleware`). Each service has its own `server.js`, in-memory demo data, and **Swagger UI** at `/api-docs`.

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
- npm (bundled with Node)

## Install dependencies

From the repository root, install each package (separate `node_modules` per service):

```bash
cd api-gateway && npm install && cd ..
cd user-service && npm install && cd ..
cd doctor-service && npm install && cd ..
cd appointment-service && npm install && cd ..
cd payment-service && npm install && cd ..
```

On Windows PowerShell, run the installs one folder at a time:

```powershell
Set-Location c:\Users\avish\Documents\git\medical-microservices\user-service; npm install
```

(repeat for `doctor-service`, `appointment-service`, `payment-service`, `api-gateway`).

Then install the **root** helper (starts all apps with one command):

```powershell
Set-Location c:\Users\avish\Documents\git\medical-microservices; npm install
```

## Run everything at once (recommended)

From the **repository root** (folder that contains `user-service`, `api-gateway`, etc.):

```powershell
npm start
```

This uses [concurrently](https://www.npmjs.com/package/concurrently) to run all five processes in **one terminal**. Logs are prefixed with `US`, `DS`, `AS`, `PS`, `GW`. Press `Ctrl+C` once to stop all of them (`-k` kills the rest if one exits).

- **Gateway:** [http://localhost:5000](http://localhost:5000)  
- **Swagger:** ports `3001`–`3004` at `/api-docs` as before  

To run only the four microservices (no gateway): `npm run start:services-only`.

## Run each service (independent)

Open **five terminals**. Start the four microservices first, then the gateway.

| Service             | Command                         | Port |
|---------------------|----------------------------------|------|
| User                | `cd user-service && npm start`   | 3001 |
| Doctor              | `cd doctor-service && npm start` | 3002 |
| Appointment         | `cd appointment-service && npm start` | 3003 |
| Payment             | `cd payment-service && npm start` | 3004 |
| API Gateway         | `cd api-gateway && npm start`  | 5000 |

### Swagger (per service)

With a service running, open:

- User: [http://localhost:3001/api-docs](http://localhost:3001/api-docs)
- Doctor: [http://localhost:3002/api-docs](http://localhost:3002/api-docs)
- Appointment: [http://localhost:3003/api-docs](http://localhost:3003/api-docs)
- Payment: [http://localhost:3004/api-docs](http://localhost:3004/api-docs)

## Call APIs through the gateway (port 5000)

The gateway strips the first path segment and forwards to the matching service.

| Gateway URL | Forwards to service path |
|-------------|---------------------------|
| `POST /users/register` | User → `POST /register` |
| `POST /users/login` | User → `POST /login` |
| `GET /users/profile` | User → `GET /profile` (header: `Authorization: Bearer <token>`) |
| `POST /doctors/doctor` | Doctor → `POST /doctor` |
| `GET /doctors/doctors` | Doctor → `GET /doctors` |
| `GET /doctors/doctors/1` | Doctor → `GET /doctors/1` |
| `POST /appointments/appointments` | Appointment → `POST /appointments` |
| `GET /appointments/appointments` | Appointment → `GET /appointments` |
| `DELETE /appointments/appointments/1` | Appointment → `DELETE /appointments/1` |
| `POST /payments/pay` | Payment → `POST /pay` |
| `GET /payments/payments` | Payment → `GET /payments` |

Gateway health and route map:

- [http://localhost:5000/health](http://localhost:5000/health)
- [http://localhost:5000/](http://localhost:5000/)

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
```

## Security note

This repo is for **demonstration**. Passwords are hashed with bcrypt; JWT uses a default secret (`JWT_SECRET` env recommended for anything beyond local demos).
