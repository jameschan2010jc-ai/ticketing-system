# Distribution and Startup Guide

## 1. Current Runtime Components

Current implemented apps:

- Customer frontend: `apps/web`, React + Vite, default dev port `5173`
- Admin console frontend: `apps/admin`, React + Vite, default dev port `5174`
- Backend API: `apps/api`, Express + TypeScript, default port `3001`
- Shared DTO contracts: `packages/shared-types`

The admin console is a separate app. The browser must be able to reach both the admin static frontend and the backend API.

## 2. Prerequisites

Install before running:

- Node.js 22 LTS recommended
- npm, included with Node.js
- Git, optional but recommended for source checkout
- A modern browser: Chrome, Edge, Firefox, or Safari

For production or internet exposure, also prepare:

- Reverse proxy or web server: Nginx, Caddy, IIS, Apache, or equivalent
- TLS certificate for HTTPS
- Process manager for the API: PM2, systemd, NSSM, Windows Service, Docker, or equivalent
- Firewall/router access for port rules and forwarding
- DNS name if browsing from the internet

Future production dependencies when real persistence is enabled:

- MySQL 8.x for business data
- Object/file storage for ID verification uploads
- Payment provider credentials and webhook configuration
- SMS/email provider credentials for verification codes

## 3. Ports and Environment Variables

Default ports:

| Component | Default | Purpose |
| --- | --- | --- |
| Web dev server | `5173` | Customer frontend during development |
| Admin dev server | `5174` | Admin console during development |
| API server | `3001` | Backend API |

Environment variables:

| Variable | Example | Used By | Purpose |
| --- | --- | --- | --- |
| `VITE_API_BASE_URL` | `http://localhost:3001` | Web | Base URL for backend API before `/api/v1` |
| `API_HOST` | `0.0.0.0` | API | Network interface to bind |
| `PORT` | `3001` | API | API listen port |
| `MYSQL_HOST` | `127.0.0.1` | API | MySQL host |
| `MYSQL_PORT` | `3306` | API | MySQL port |
| `MYSQL_USER` | `ticketing_app` | API | MySQL application user |
| `MYSQL_PASSWORD` | `change_me` | API | MySQL application password |
| `MYSQL_DATABASE` | `ticketing_app` | API | MySQL database name |

Create local env file:

```powershell
Copy-Item .env.example .env
```

The frontend Vite config and backend env loader are configured to read this repo-root `.env` file.

## 4. Install Procedure

From repo root:

```powershell
npm install
```

Build checks:

```powershell
npm run build:api
npm run build:web
npm run build:admin
```

MySQL setup baseline:

```sql
CREATE DATABASE ticketing_app CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
CREATE USER 'ticketing_app'@'%' IDENTIFIED BY 'change_me';
GRANT ALL PRIVILEGES ON ticketing_app.* TO 'ticketing_app'@'%';
FLUSH PRIVILEGES;
```

For production, restrict the MySQL user host to the API server address instead of `%` and use a strong password.

## 5. Scenario 1: Frontend and Backend on One PC, Browser on Same PC

Use this for normal local development.

`.env`:

```env
VITE_API_BASE_URL=http://localhost:3001
API_HOST=127.0.0.1
PORT=3001
```

Terminal 1:

```powershell
npm run dev:api
```

Terminal 2:

```powershell
npm run dev:web
```

Terminal 3:

```powershell
npm run dev:admin
```

Open in browser on the same PC:

- Customer frontend: `http://localhost:5173`
- Admin console: `http://localhost:5174`
- Backend health: `http://localhost:3001/api/v1/health`

Security notes:

- Binding API to `127.0.0.1` keeps it local-only.
- No firewall rule is needed for same-PC browsing.

## 6. Scenario 2: Frontend and Backend on One PC, Browser from Another PC on Same LAN

Use this for internal demo/testing from another computer on the same network.

Find server PC LAN IP:

```powershell
ipconfig
```

Assume server PC IP is `192.168.1.50`.

`.env` on server PC:

```env
VITE_API_BASE_URL=http://192.168.1.50:3001
API_HOST=0.0.0.0
PORT=3001
```

Terminal 1 on server PC:

```powershell
npm run dev:api
```

Terminal 2 on server PC:

```powershell
npm run dev:web:lan
```

Terminal 3 on server PC:

```powershell
npm run dev:admin:lan
```

Open from another LAN PC:

- Customer frontend: `http://192.168.1.50:5173`
- Admin console: `http://192.168.1.50:5174`
- Backend health: `http://192.168.1.50:3001/api/v1/health`

Firewall requirements on server PC:

- Allow inbound TCP `5173` for web dev server.
- Allow inbound TCP `5174` for admin dev server.
- Allow inbound TCP `3001` for API server.

Important notes:

- The frontend must be built or started with `VITE_API_BASE_URL` pointing to the LAN-reachable API address.
- Vite must use `--host 0.0.0.0`; use `npm run dev:web:lan`.
- Use LAN access only on trusted networks.

## 7. Scenario 3: Frontend and Backend on One PC, Browser from Internet

Do not expose Vite dev server directly to the internet. Use production build artifacts behind HTTPS.

Recommended internet topology:

- Public domain: `https://ticket.example.com`
- Admin domain: `https://admin.ticket.example.com`
- Static frontend served by reverse proxy/web server.
- Backend API served behind the same domain under `/api/v1`.
- Reverse proxy forwards `/api/*` to `http://127.0.0.1:3001`.

Production `.env` before building web:

Option A, same-origin API through reverse proxy:

```env
VITE_API_BASE_URL=https://ticket.example.com
API_HOST=127.0.0.1
PORT=3001
```

Option B, separate API subdomain:

```env
VITE_API_BASE_URL=https://api.ticket.example.com
API_HOST=127.0.0.1
PORT=3001
```

Build:

```powershell
npm run build:api
npm run build:web
npm run build:admin
```

Start API:

```powershell
npm run start:api
```

Serve frontend:

- Serve `apps/web/dist` with Nginx, Caddy, IIS, Apache, or another static web server.
- Serve `apps/admin/dist` as the admin console, preferably on a separate admin host/subdomain.
- Configure HTTPS.
- Configure route fallback to `index.html` if client-side routing is added later.

Reverse proxy rule:

- Forward `/api/` to `http://127.0.0.1:3001/api/`.

Firewall/router requirements:

- Public inbound `443` to reverse proxy.
- Optional public inbound `80` only for HTTP to HTTPS redirect or certificate challenge.
- Do not expose `3001`, `5173`, or future admin dev ports publicly.

Internet security checklist:

- Use HTTPS only.
- Add production CORS allowlist.
- Run API behind a process manager.
- Add request logs and error logs.
- Keep secrets out of source code.
- Configure payment/SMS/email provider webhooks with public HTTPS URLs.
- Protect admin console with admin auth, RBAC, and strong session policy before public exposure.

## 8. Startup Quick Reference

Local same-PC development:

```powershell
npm install
Copy-Item .env.example .env
npm run dev:api
npm run dev:web
npm run dev:admin
```

LAN development:

```powershell
npm install
Copy-Item .env.example .env
# Edit VITE_API_BASE_URL to http://<server-lan-ip>:3001
npm run dev:api
npm run dev:web:lan
npm run dev:admin:lan
```

Production build:

```powershell
npm install
npm run build:api
npm run build:web
npm run build:admin
npm run start:api
```

## 9. Current Implementation Status

Available backend endpoints:

- `GET /api/v1/health`
- `GET /api/v1/home-content`
- `GET /api/v1/purchase-method/options`
- `GET /api/v1/purchase-method/guest-notice`
- `GET /api/v1/purchase-content/options`
- `POST /api/v1/purchase-content/confirm`
- `POST /api/v1/orders`
- `GET /api/v1/orders/my`
- `GET /api/v1/tickets/my`
- `POST /api/v1/orders/{orderId}/payments`
- `GET/POST /api/v1/admin/parks`
- `PATCH /api/v1/admin/parks/{parkId}/status`
- `DELETE /api/v1/admin/parks/{parkId}`
- `GET/PUT /api/v1/admin/park/profile`
- `GET/POST /api/v1/admin/ticket-types`
- `PUT /api/v1/admin/ticket-types/{ticketTypeId}`
- `PATCH /api/v1/admin/ticket-types/{ticketTypeId}/status`
- `DELETE /api/v1/admin/ticket-types/{ticketTypeId}`
- `GET /api/v1/admin/orders`
- `GET /api/v1/admin/users`

Available frontend flow:

- p1 Home
- p2 Purchase Method
- p3 Guest Purchase Notice
- p10 Purchase Content
- p11, p12, p13
- p30, p31, p32, p33
- p40, p41, p42
- p50, p51, p52, p53
- p60, p61, p62, p63, p64

Available admin console:

- Login shell
- Park selector that represents `X-Park-Id`
- Overview, park config, ticket catalog, order operations, user operations, analytics, and audit views
- Park add, delete, activate, and deactivate operations
- Ticket type add, delete, activate, and deactivate operations
- Order operations table with order number, user name, payment status, ticket type, ticket price, purchase date, admission date/time, verification data, and QR code
- User operations table with registration type/date, last password change time, order count, total spend, total ticket count, and unused ticket count
