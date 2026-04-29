# Backend Design Plan (Ticketing System)

## 1. Goal and Scope

Build a backend platform that supports:

- Park-related configuration management
- Ticket product and sales configuration
- User account and authentication management
- Customer-facing purchase flow APIs
- Admin web APIs for data/parameter configuration and operations
- Operational reporting and statistical analysis for ticket purchases

This plan targets the current stack:

- Runtime: Node.js
- Framework: Express
- Language: TypeScript

## 2. System Context and Boundary

The backend serves two client surfaces:

- Customer Web App (`apps/web`): browsing park info, purchase, account/profile, tickets
- Admin Web App (`apps/admin`): configuring parameters, monitoring orders/tickets/users, viewing analytics

Scope note from current spec alignment:

- This plan focuses on backend data and business APIs in Chapter 1-3 scope.
- Gate machine firmware/API interaction in Chapter 4 is intentionally excluded for now.

Core architecture direction:

- Single backend platform (one system) with multi-park tenant isolation
- Modular monolith first (domain modules with strict boundaries)
- Shared DTO contracts in `packages/shared-types`
- REST APIs with versioning (`/api/v1/...`) for customer and admin

## 3. Multi-Park Tenant Model (Spec-Aligned)

Tenant boundary:

- Every business record must be tenant-scoped by `park_id`.
- Cross-park query/update is blocked by policy.
- All park operational rules (pricing, capacity, schedule) are park-local.

Account model:

- User account identity is centrally managed across parks.
- A single user account can transact in one or more parks.
- Orders/tickets remain park-scoped even for shared user identity.

Access model:

- Customer requests carry resolved `park_id` context.
- Admin requests must include role-based access to one or more parks.
- Admin park-scoped APIs use the selected `X-Park-Id` header as the tenant context.
- Do not use `/admin/parks/{parkId}/...` URL paths for the baseline admin API design.

## 4. Domain Modules

1. `auth` module
- Login/logout
- Registration (phone/email)
- Verification code issuance/validation
- Password reset/change
- Session/token lifecycle

2. `user` module
- User profile and account state
- Account lookup for admin
- User status management (active/locked)
- User-to-park authorization mapping

3. `park-config` module
- Park base profile (name, intro, images, open date range)
- Operating schedule and blackout dates
- Pre-booking window (e.g., 7/14/30 days)
- Payment method enable/disable per park

4. `ticket-catalog` module
- Flexible ticket naming (not fixed ticket-class enum)
- Ticket type definitions and activation status
- Price rules and validity windows
- Verification-required flag and constraints by ticket
- Daily cap and period-total cap definitions

5. `sales-control` module
- Real-time remaining quantity computation
- Daily cap control (by visit date)
- Period-total cap control (by sales period)
- Composite cap rule (smaller remaining quantity wins)
- Oversell prevention with transactional locking

6. `order` module
- Order creation from purchase selections
- Payment status lifecycle (pending, paid, failed, timeout, canceled, refunded)
- Quantity deduction and rollback/replenishment policy

7. `ticket` module
- Ticket issuance per paid order
- Ticket usage status tracking
- QR code generation and retrieval
- User ticket list (unused/history)

8. `verification` module
- ID image upload metadata
- Qualification verification workflow and result record
- Failure reasons and retry lifecycle
- Store verification result/record only (no manual review queue in current scope)

9. `analytics` module
- Aggregated metrics and time-series reporting
- Dashboard query APIs for admin

10. `admin` module
- RBAC for admin users
- Admin-facing APIs for config CRUD and operational lists
- Audit logging for configuration/rule changes

## 5. API Surface Plan

Detailed implementation catalog:

- `docs/architecture/backend-api-catalog.md`

### 5.1 Customer APIs

Continue and normalize existing customer routes under `/api/v1`:

- `/api/v1/home-content`
- `/api/v1/purchase-content/options`
- `/api/v1/purchase-content/confirm`
- `/api/v1/orders/my`
- `/api/v1/tickets/my`
- `/api/v1/tickets/{ticketId}/qr`
- `/api/v1/auth/*`
- `/api/v1/profile/*`

### 5.2 Admin APIs (new)

Add `/api/v1/admin/...` namespace:

- Park config
- `GET/PUT /admin/park/profile`
- `GET/PUT /admin/park/schedule`
- `GET/PUT /admin/park/booking-window`
- `GET/PUT /admin/park/payment-methods`

- Ticket catalog/config
- `GET/POST/PUT /admin/ticket-types`
- `GET/PUT /admin/ticket-pricing-rules`
- `GET/PUT /admin/ticket-verification-rules`
- `GET/PUT /admin/ticket-sales-limits`

- Operations
- `GET /admin/orders`
- `GET /admin/orders/{orderId}`
- `GET /admin/tickets`
- `GET /admin/tickets/{ticketId}`
- `GET /admin/users`
- `GET /admin/users/{userId}`
- `PATCH /admin/users/{userId}/status`

- Analytics
- `GET /admin/analytics/overview`
- `GET /admin/analytics/sales-trend`
- `GET /admin/analytics/ticket-type-breakdown`
- `GET /admin/analytics/verification-funnel`

## 6. Data Model Plan (High-Level)

Use MySQL 8.x with tenant-first schema design.

Core entity groups:

- Tenant/Park: park profile, schedule, booking/payment settings
- Account: user identity, credentials, sessions, verification code records
- Commerce: ticket catalog, sales limits, orders, payments, tickets, ticket usage
- Verification: ID verification request/result records
- Admin/Governance: admin users, roles, audit logs
- Analytics: aggregated fact tables and rollup/read-model tables

Mandatory design rule:

- All park-operational tables include `park_id` and indexed tenant key.

## 7. Spec-Required Business Rules

1. Guest purchase model
- Guest purchase is allowed.
- Guest order/ticket data is stored for operations/statistics.
- Guest has no long-term account binding and no self-service order modification/refund flow.

2. Sales limit model
- Daily cap by visit date.
- Period-total cap by configured sales period.
- Composite cap rule enforced atomically to prevent oversell.

3. Quantity and payment consistency
- Payment success: create/finalize order, deduct quantity, issue tickets.
- Payment fail/timeout: do not finalize paid order and replenish reserved quantity.

4. Verification-required ticket behavior
- Verification-pass required before payment for designated ticket types.
- Verification failures block purchase of that ticket type.

5. Purchase quantity model
- Max 1 ticket per order is a global system rule for all customer purchase flows.

## 8. Admin Web Capability Plan

Admin web should support these page groups:

1. Configuration
- Park profile and operating schedule
- Booking window and payment-method enablement
- Flexible ticket naming, price, verification, and sales limits

2. Operations
- Order list/detail and status visibility
- Ticket list/detail and usage status
- User account list/detail and account state

3. Analytics
- Daily/weekly/monthly sales trend
- Revenue by ticket type
- Conversion funnel (selection -> verification -> payment success)
- Verification pass/fail ratio

4. Governance
- Admin role management
- Audit trail for parameter changes

## 9. Statistical Analysis Plan

Define baseline metrics first:

- GMV (gross ticket sales amount)
- Paid order count
- Ticket issued count
- Ticket used count
- Verification-required ticket ratio
- Verification pass rate and fail-reason distribution
- Payment method share
- Repeat purchase rate

Aggregation strategy:

- Near-real-time counters from transactional tables
- Nightly batch rollup tables for heavy dashboard queries
- Separate read models for analytics endpoints to keep customer APIs responsive

## 10. Security and Compliance

Authentication and authorization:

- Customer auth: session/JWT with refresh strategy
- Admin auth: stricter session policy + RBAC
- Tenant access checks applied at service/repository layer

Sensitive data handling:

- Encrypt secrets and credentials
- Protect ID document metadata and storage links
- Store only required verification artifacts with retention policy

Operational controls:

- Rate limit on auth and verification endpoints
- Centralized input validation (zod/class-validator)
- Full admin audit logs for config changes

## 11. Non-Functional Targets

- API p95 response (customer critical paths): <= 500 ms excluding third-party latency
- API p95 response (admin list/query): <= 1000 ms for paginated views
- Availability target: 99.9% for customer APIs
- Observability: structured logs, tracing IDs, error dashboards, alerting

## 12. Suggested Code Structure (apps/api)

- `src/routes/`
- `src/controllers/`
- `src/services/`
- `src/repositories/`
- `src/domain/` (entities/value objects/domain services)
- `src/policies/` (RBAC/authz)
- `src/middlewares/`
- `src/jobs/` (aggregation/cleanup jobs)
- `src/lib/` (db, cache, queue, storage adapters)

## 13. Delivery Phases

Phase 1: Foundation

- Project skeleton, DB migrations, tenant boundary baseline
- Auth/session baseline and park config read APIs

Phase 2: Sales and Purchase Core

- Ticket catalog + sales-limit engines
- Order/payment consistency and anti-oversell controls
- Guest/registered purchase flows

Phase 3: Profile and Ticket Operations

- User profile APIs
- My orders / my tickets / QR retrieval APIs
- Change-password and account-state management

Phase 4: Admin Console Backend

- Admin auth + RBAC
- Config CRUD APIs
- Order/ticket/user list APIs

Phase 5: Analytics and Governance

- Aggregation jobs and read models
- Dashboard analytics endpoints
- Audit logs completion and retention policy

## 14. Immediate Next Design Outputs

1. `docs/architecture/backend-data-organization.md`
- Database organization and table/field definitions

2. `docs/architecture/backend-api-catalog.md`
- Endpoint catalog with request/response and auth requirements
- Confirmed decisions: global one-ticket-per-order rule, admin `X-Park-Id` tenant selection, no legacy unversioned API routes after `/api/v1` rollout

3. `docs/architecture/admin-web-capability-map.md`
- Mapping between admin pages and backend APIs

4. `docs/architecture/analytics-kpi-definition.md`
- KPI formulas, dimensions, and refresh frequency
