# Backend API Plan and Catalog

## 1. Purpose

This document is the implementation-facing backend API plan for the ticketing system. It expands the high-level API surface in `backend-design-plan.md` into route conventions, auth/tenant rules, endpoint catalog, workflow boundaries, and implementation phases.

Primary sources:

- `docs/architecture/backend-design-plan.md`
- `docs/architecture/backend-data-organization.md`
- `docs/specs/requirements-traceability.md`
- `docs/specs/backend-services/SVC-*.md`

Scope:

- Customer web APIs for park browsing, purchase, auth, verification, profile, orders, tickets, and QR retrieval.
- Admin web APIs for configuration, operations, analytics, RBAC, and audit logs.
- Gate-machine firmware/API interaction is excluded for this phase.

## 2. API Principles

1. Use REST + JSON for all standard APIs.
2. Version customer/admin routes under `/api/v1`.
3. Keep route handlers thin: route -> controller -> service -> repository.
4. Put request/response contracts in `packages/shared-types`.
5. Enforce tenant isolation in middleware and again in service/repository policy checks.
6. Use idempotency keys for order/payment mutation endpoints.
7. Keep customer APIs fast and simple; push heavy reporting into analytics read models.

Compatibility note:

- Existing backend service specs currently list unversioned paths such as `/api/home-content`.
- Target implementation should mount canonical paths under `/api/v1/...`.
- No legacy unversioned `/api/...` compatibility routes are required after `/api/v1` rollout. Frontend callers and tests should migrate to `/api/v1`.

## 3. Global API Conventions

### 3.1 Base Paths

- Customer/public: `/api/v1/...`
- Admin: `/api/v1/admin/...`
- Health: `/api/v1/health`

### 3.2 Headers

| Header | Required | Applies To | Purpose |
| --- | --- | --- | --- |
| `X-Park-Id` | Yes after park resolution | Customer/admin park-scoped APIs | Tenant boundary for park-local data |
| `Authorization: Bearer <token>` | When authenticated | Customer/admin protected APIs | Session/JWT access token |
| `X-Request-Id` | Optional inbound, always returned | All APIs | Trace correlation |
| `Idempotency-Key` | Yes | Order/payment mutation APIs | Prevent duplicate order/payment actions |
| `Content-Type: application/json` | Yes | JSON body APIs | Standard JSON input |
| `Content-Type: multipart/form-data` | Yes | ID upload API | Image upload |

Park resolution order:

1. Explicit `X-Park-Id`.
2. Park code in URL/query when added later.
3. Host/domain mapping if deployed per park domain.
4. Default development park only in local/dev environments.

### 3.3 Auth Modes

| Mode | Meaning |
| --- | --- |
| Public | No login required, but park context required where applicable |
| Optional customer | Login enriches response, guest still allowed |
| Customer required | Authenticated customer account required |
| Guest session | Anonymous purchase session required |
| Admin required | Authenticated admin required |
| Admin permission | Admin plus named permission required |

### 3.4 Common Success Shapes

Single resource:

```json
{
  "data": {}
}
```

List resource:

```json
{
  "items": [],
  "pageInfo": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 0,
    "totalPages": 0
  }
}
```

Command result:

```json
{
  "success": true,
  "data": {}
}
```

### 3.5 Common Error Shape

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Request payload is invalid.",
  "details": {},
  "traceId": "req_..."
}
```

Common status mapping:

| Status | Use |
| --- | --- |
| `400` | Invalid request, query, or body |
| `401` | Missing/invalid authentication |
| `403` | Authenticated but not allowed |
| `404` | Resource not found inside current tenant |
| `409` | Business conflict, stale state, price/capacity changed |
| `410` | Expired purchase/order context |
| `422` | Valid shape but unacceptable business payload |
| `423` | Locked account/resource |
| `429` | Rate limit |
| `500` | Unexpected server error |
| `503` | Dependency unavailable |
| `504` | Dependency timeout |

### 3.6 Pagination, Sorting, and Filters

Standard list query:

- `page`: default `1`
- `pageSize`: default `20`, max `100`
- `sort`: field name, optional `-` prefix for descending
- `status`, `fromDate`, `toDate`, `ticketTypeId`, `keyword`: endpoint-specific filters

Date conventions:

- `date` fields use `YYYY-MM-DD` in the park timezone.
- `datetime` fields use ISO 8601 UTC.
- Analytics endpoints accept local date ranges and return the park timezone in response metadata.

## 4. Tenant and Authorization Policy

Customer policy:

- Public browsing APIs require a resolved `park_id`.
- Guest purchase APIs use a short-lived anonymous purchase session.
- Authenticated customer APIs must scope data by current `user_id` and `park_id`.
- Guest orders are stored for operations/statistics but are not exposed through `GET /orders/my`.

Admin policy:

- Admin access is centrally authenticated.
- Admin role bindings define accessible parks and permissions.
- Park-scoped admin APIs require `X-Park-Id` and reject access outside bound parks.
- Every create/update/delete admin action writes an audit log with before/after JSON.

Repository policy:

- Every query against a park-operational table must include `park_id`.
- Service methods should pass `parkId` explicitly, not read global state.
- Cross-park reads require an explicit global admin permission and should be limited to aggregate admin features.

## 5. Customer API Catalog

### 5.1 Health and Platform

| Method | Path | Auth | Purpose | Contract / Spec |
| --- | --- | --- | --- | --- |
| `GET` | `/api/v1/health` | Public | API health check | `HealthResponse` |

### 5.2 Home and Purchase Entry

| Method | Path | Auth | Purpose | Contract / Spec |
| --- | --- | --- | --- | --- |
| `GET` | `/api/v1/home-content` | Public | Homepage park content and CTA state | `HomeContentResponse`, `SVC-001` |
| `GET` | `/api/v1/purchase-method/options` | Public | Login/register/guest purchase options | `PurchaseMethodOptionsResponse`, `SVC-002` |
| `GET` | `/api/v1/purchase-method/guest-notice` | Public | Guest purchase notice content | `GuestPurchaseNoticeResponse`, `SVC-003` |

### 5.3 Purchase Selection

| Method | Path | Auth | Purpose | Contract / Spec |
| --- | --- | --- | --- | --- |
| `GET` | `/api/v1/purchase-content/options` | Optional customer / guest session | Available dates, times, ticket types, remaining quantity | `PurchaseContentOptionsResponse`, `SVC-010` |
| `POST` | `/api/v1/purchase-content/confirm` | Optional customer / guest session | Validate selection and create short-lived purchase context | `PurchaseContentConfirmRequest`, `PurchaseContentConfirmResponse`, `SVC-010` |
| `GET` | `/api/v1/order-confirmation/summary` | Optional customer / guest session | Return summary for latest purchase context | `OrderConfirmationSummaryResponse`, `SVC-011` |

Target request for `POST /purchase-content/confirm`:

```json
{
  "visitDate": "2026-05-01",
  "timeSlotId": "uuid",
  "ticketTypeId": "uuid",
  "quantity": 1,
  "purchaseMode": "guest"
}
```

Target response:

```json
{
  "purchaseContextId": "uuid",
  "requiresIdVerification": true,
  "nextStep": "verification_required_order",
  "expiresAt": "2026-04-28T08:30:00Z"
}
```

Purchase quantity rule:

- Max 1 ticket per order is a global system rule for all customer purchase flows.
- Keep request/response contracts capable of carrying `quantity` for traceability, but validate the value as exactly `1` unless a future approved change revises this rule.

### 5.4 Verification-Required Ticket Flow

| Method | Path | Auth | Purpose | Contract / Spec |
| --- | --- | --- | --- | --- |
| `GET` | `/api/v1/ticket-verification/order-context` | Optional customer / guest session | Read context for verification-required order page | `VerificationRequiredOrderContextResponse`, `SVC-050` |
| `POST` | `/api/v1/ticket-verification/upload-id` | Optional customer / guest session | Upload ID image metadata/file | `UploadIdRequest`, `UploadIdResponse`, `SVC-051` |
| `POST` | `/api/v1/ticket-verification/verify` | Optional customer / guest session | Run eligibility check and persist result | `VerifyTicketEligibilityRequest`, `VerifyTicketEligibilityResponse`, `SVC-051` |
| `GET` | `/api/v1/ticket-verification/result-context` | Optional customer / guest session | Result page context for pass/fail pages | `VerificationResultContextResponse`, `SVC-052` |

Verification rules:

- Verification-required tickets cannot proceed to payment until a passed result exists for the purchase context.
- Failed verification blocks only the selected verification-required ticket type.
- No manual review queue is in current scope.
- Uploaded ID artifacts must follow retention and access controls.

### 5.5 Order and Payment

| Method | Path | Auth | Purpose | Contract / Spec |
| --- | --- | --- | --- | --- |
| `POST` | `/api/v1/orders` | Optional customer / guest session | Create pending order and inventory reservation from purchase context | New target contract |
| `GET` | `/api/v1/orders/{orderId}` | Customer required or guest order token | Read order detail in allowed context | New target contract |
| `GET` | `/api/v1/payment/methods` | Optional customer / guest session | Return enabled payment methods | `PaymentMethodListResponse`, `SVC-012` |
| `POST` | `/api/v1/orders/{orderId}/payments` | Optional customer / guest session | Initiate payment with selected method | New target contract |
| `POST` | `/api/v1/payments/{paymentId}/dev-confirm` | Dev only | Simulate payment success while real payment is skipped | New target contract |
| `GET` | `/api/v1/payment/success-summary` | Customer required or guest order token | Return success voucher and ticket QR data | `PaymentSuccessSummaryResponse`, `SVC-013` |
| `POST` | `/api/v1/payment/webhooks/{provider}` | Provider signed request | Receive provider payment result | New target contract |

Order creation rules:

- `POST /orders` revalidates price, schedule, sales window, verification result, and remaining capacity.
- It creates `orders`, `order_items`, and `inventory_reservations` in one transaction.
- It does not issue tickets until payment succeeds.
- Use `Idempotency-Key` to return the same order for duplicate submissions.

Payment success rules:

- Payment success consumes the reservation, marks order paid, records payment success, and issues tickets in one transaction.
- Payment failure/timeout releases the reservation.
- Webhooks must verify provider signature before mutating order state.
- Duplicate webhooks are idempotent.

### 5.6 Authentication and Account

| Method | Path | Auth | Purpose | Contract / Spec |
| --- | --- | --- | --- | --- |
| `GET` | `/api/v1/auth/session-status` | Optional customer | Determine logged-in vs logged-out profile routing | `SessionStatusResponse`, `SVC-060` |
| `POST` | `/api/v1/auth/login-existing-account` | Public | Login with phone/email and password | `LoginExistingAccountRequest`, `LoginExistingAccountResponse`, `SVC-030` |
| `POST` | `/api/v1/auth/logout` | Customer required | Revoke current session | `LogoutResponse`, `SVC-061` |
| `GET` | `/api/v1/auth/success-context` | Customer required | Auth success page context | `AuthSuccessContextResponse`, `SVC-032` |
| `GET` | `/api/v1/auth/register/methods` | Public | Phone/email registration options | `RegistrationMethodOptionsResponse`, `SVC-040` |
| `POST` | `/api/v1/auth/register/phone/send-code` | Public | Send phone verification code | `SendPhoneCodeRequest`, `SendCodeResponse`, `SVC-041` |
| `POST` | `/api/v1/auth/register/phone/complete` | Public | Complete phone registration | `CompletePhoneRegistrationRequest`, `RegistrationCompleteResponse`, `SVC-041` |
| `POST` | `/api/v1/auth/register/email/send-code` | Public | Send email verification code | `SendEmailCodeRequest`, `SendCodeResponse`, `SVC-042` |
| `POST` | `/api/v1/auth/register/email/complete` | Public | Complete email registration | `CompleteEmailRegistrationRequest`, `RegistrationCompleteResponse`, `SVC-042` |
| `POST` | `/api/v1/auth/forgot-password/send-code` | Public | Send reset verification code | New target contract |
| `POST` | `/api/v1/auth/forgot-password/reset` | Public | Verify code and reset password | `ForgotPasswordResetRequest`, `ForgotPasswordResetResponse`, `SVC-031` |
| `POST` | `/api/v1/auth/change-password/send-code` | Customer required | Send profile change-password code | `ChangePasswordSendCodeRequest`, `SendCodeResponse`, `SVC-033` |
| `POST` | `/api/v1/auth/change-password/complete` | Customer required | Complete password change | `ChangePasswordCompleteRequest`, `ChangePasswordCompleteResponse`, `SVC-033` |

Auth rules:

- Password policy baseline: 8-20 alphanumeric characters, until business confirms stronger rules.
- Verification codes are one-time, hashed at rest, and expire.
- Rate limit login/code endpoints by IP and target identifier.
- Login failures return safe messages and do not expose account existence beyond required flows.

### 5.7 Profile, My Orders, and My Tickets

| Method | Path | Auth | Purpose | Contract / Spec |
| --- | --- | --- | --- | --- |
| `GET` | `/api/v1/profile/summary` | Customer required | Profile center summary | `ProfileSummaryResponse`, `SVC-061` |
| `GET` | `/api/v1/orders/my` | Customer required | Paginated current user's orders | `MyOrdersResponse`, `SVC-062` |
| `GET` | `/api/v1/tickets/my?status=unused` | Customer required | Current user's unused tickets | `MyTicketsResponse`, `SVC-063` |
| `GET` | `/api/v1/tickets/my?status=used` | Customer required | Current user's used/history tickets | `MyTicketsResponse`, `SVC-064` |
| `GET` | `/api/v1/tickets/{ticketId}/qr` | Customer required | QR payload for valid unused ticket | `TicketQrResponse`, `SVC-063` |

Profile rules:

- Only registered users can use `orders/my` and `tickets/my`.
- Guest purchases are not bound to long-term profile history.
- QR access rejects cross-user and cross-park reads.

## 6. Admin API Catalog

All admin endpoints require `Authorization` and admin RBAC. Park-scoped endpoints require `X-Park-Id`.

Admin park selection:

- Admin APIs use the selected `X-Park-Id` header for park-scoped operations.
- Do not duplicate the selected park in URL paths such as `/admin/parks/{parkId}/...` for the baseline design.

### 6.1 Admin Auth and Session

| Method | Path | Permission | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/v1/admin/auth/login` | Public admin | Admin login |
| `POST` | `/api/v1/admin/auth/logout` | Admin | Revoke admin session |
| `GET` | `/api/v1/admin/auth/session` | Admin | Current admin profile, roles, park access |

### 6.2 Park Configuration

| Method | Path | Permission | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/v1/admin/parks` | `parks:read` | List parks available to admin |
| `GET` | `/api/v1/admin/park/profile` | `park_profile:read` | Read selected park profile |
| `PUT` | `/api/v1/admin/park/profile` | `park_profile:write` | Update intro, images, open date range |
| `GET` | `/api/v1/admin/park/schedule` | `park_schedule:read` | List schedule/blackout dates |
| `PUT` | `/api/v1/admin/park/schedule` | `park_schedule:write` | Replace/update schedule rules |
| `GET` | `/api/v1/admin/park/booking-window` | `park_settings:read` | Read pre-booking and max quantity settings |
| `PUT` | `/api/v1/admin/park/booking-window` | `park_settings:write` | Update booking window settings |
| `GET` | `/api/v1/admin/park/payment-methods` | `payment_settings:read` | Read enabled payment methods |
| `PUT` | `/api/v1/admin/park/payment-methods` | `payment_settings:write` | Enable/disable payment methods |

### 6.3 Ticket Catalog and Sales Rules

| Method | Path | Permission | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/v1/admin/ticket-types` | `ticket_catalog:read` | List ticket types |
| `POST` | `/api/v1/admin/ticket-types` | `ticket_catalog:write` | Create ticket type |
| `GET` | `/api/v1/admin/ticket-types/{ticketTypeId}` | `ticket_catalog:read` | Read ticket type detail |
| `PUT` | `/api/v1/admin/ticket-types/{ticketTypeId}` | `ticket_catalog:write` | Update ticket name, description, status, validity |
| `GET` | `/api/v1/admin/ticket-types/{ticketTypeId}/pricing` | `ticket_catalog:read` | Read pricing rules |
| `PUT` | `/api/v1/admin/ticket-types/{ticketTypeId}/pricing` | `ticket_catalog:write` | Update price and sales date window |
| `GET` | `/api/v1/admin/ticket-types/{ticketTypeId}/verification-rules` | `ticket_catalog:read` | Read verification settings |
| `PUT` | `/api/v1/admin/ticket-types/{ticketTypeId}/verification-rules` | `ticket_catalog:write` | Update verification-required flag and constraints |
| `GET` | `/api/v1/admin/ticket-types/{ticketTypeId}/sales-limits` | `sales_limits:read` | Read daily/period caps |
| `PUT` | `/api/v1/admin/ticket-types/{ticketTypeId}/sales-limits` | `sales_limits:write` | Update daily/period caps |
| `GET` | `/api/v1/admin/sales-control/availability` | `sales_limits:read` | Inspect effective remaining quantity by visit date |

Sales-limit rules:

- Effective remaining quantity is the minimum of daily remaining and period remaining when both are enabled.
- Updates to caps must not make already sold/reserved quantity invalid without explicit admin warning.
- Customer purchase paths must lock relevant sales counter rows during order reservation.

### 6.4 Operations

| Method | Path | Permission | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/v1/admin/orders` | `orders:read` | Paginated order list with filters |
| `GET` | `/api/v1/admin/orders/{orderId}` | `orders:read` | Order detail with items/payments/tickets |
| `PATCH` | `/api/v1/admin/orders/{orderId}/status` | `orders:write` | Admin status operation when business-approved |
| `GET` | `/api/v1/admin/tickets` | `tickets:read` | Paginated ticket list |
| `GET` | `/api/v1/admin/tickets/{ticketId}` | `tickets:read` | Ticket detail and usage logs |
| `GET` | `/api/v1/admin/users` | `users:read` | User list/search |
| `GET` | `/api/v1/admin/users/{userId}` | `users:read` | User account detail and park purchase summary |
| `PATCH` | `/api/v1/admin/users/{userId}/status` | `users:write` | Lock/unlock/deactivate account |
| `GET` | `/api/v1/admin/verifications` | `verifications:read` | Verification request/result list |
| `GET` | `/api/v1/admin/verifications/{requestId}` | `verifications:read` | Verification detail and fail reasons |

Operations filters:

- Orders: `status`, `orderNo`, `userKeyword`, `visitDate`, `createdFrom`, `createdTo`, `paymentMethod`.
- Tickets: `status`, `ticketNo`, `orderNo`, `ticketTypeId`, `visitDate`.
- Users: `status`, `phone`, `email`, `createdFrom`, `createdTo`.
- Verifications: `resultStatus`, `ticketTypeId`, `createdFrom`, `createdTo`, `reasonCode`.

### 6.5 Analytics

| Method | Path | Permission | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/v1/admin/analytics/overview` | `analytics:read` | GMV, paid orders, issued tickets, used tickets |
| `GET` | `/api/v1/admin/analytics/sales-trend` | `analytics:read` | Daily/weekly/monthly sales and order trend |
| `GET` | `/api/v1/admin/analytics/ticket-type-breakdown` | `analytics:read` | Revenue/count by ticket type |
| `GET` | `/api/v1/admin/analytics/verification-funnel` | `analytics:read` | Selection -> verification -> payment conversion |
| `GET` | `/api/v1/admin/analytics/payment-method-share` | `analytics:read` | Payment method distribution |

Analytics query parameters:

- `fromDate`: required
- `toDate`: required
- `granularity`: `day`, `week`, `month`
- `ticketTypeId`: optional

Analytics rules:

- Use transactional tables for near-real-time small queries.
- Use rollup/fact tables for dashboard-range queries.
- Response metadata must include `generatedAt`, `timezone`, and `dataFreshness`.

### 6.6 Governance and Audit

| Method | Path | Permission | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/v1/admin/admin-users` | `admin_users:read` | List admin users |
| `POST` | `/api/v1/admin/admin-users` | `admin_users:write` | Create admin user |
| `PATCH` | `/api/v1/admin/admin-users/{adminId}` | `admin_users:write` | Update admin status/profile |
| `GET` | `/api/v1/admin/roles` | `roles:read` | List roles and permissions |
| `POST` | `/api/v1/admin/roles` | `roles:write` | Create role |
| `PUT` | `/api/v1/admin/roles/{roleId}` | `roles:write` | Update role permissions |
| `PUT` | `/api/v1/admin/admin-users/{adminId}/role-bindings` | `roles:write` | Bind admin to roles/parks |
| `GET` | `/api/v1/admin/audit-logs` | `audit_logs:read` | Search admin audit logs |

Audit rules:

- All admin writes include `admin_id`, `park_id`, action, target entity/id, before JSON, after JSON, and timestamp.
- Audit log reads should be immutable and paginated.
- Sensitive fields must be redacted before storage and response.

## 7. Core Workflows

### 7.1 Guest or Registered Purchase

1. `GET /home-content`
2. `GET /purchase-method/options`
3. Optional guest notice: `GET /purchase-method/guest-notice`
4. `GET /purchase-content/options`
5. `POST /purchase-content/confirm`
6. If verification is required, run verification flow.
7. `GET /order-confirmation/summary`
8. `POST /orders` with `Idempotency-Key`
9. `GET /payment/methods`
10. `POST /orders/{orderId}/payments`
11. Payment webhook or dev confirm marks paid.
12. `GET /payment/success-summary`

### 7.2 Verification Flow

1. `GET /ticket-verification/order-context`
2. `POST /ticket-verification/upload-id`
3. `POST /ticket-verification/verify`
4. `GET /ticket-verification/result-context`
5. On pass, customer may continue to payment.
6. On fail, customer may re-upload if retry policy allows.

### 7.3 Admin Config Change

1. Admin logs in and selects park.
2. Admin reads current config.
3. Admin submits update with `X-Park-Id`.
4. Service validates tenant access and business constraints.
5. Repository writes config in transaction.
6. Audit log is written in the same transaction.
7. Response returns updated resource and audit id.

## 8. Implementation Plan

Suggested route structure:

- `apps/api/src/routes/v1/index.ts`
- `apps/api/src/routes/v1/health.route.ts`
- `apps/api/src/routes/v1/home.route.ts`
- `apps/api/src/routes/v1/purchase-method.route.ts`
- `apps/api/src/routes/v1/purchase-content.route.ts`
- `apps/api/src/routes/v1/order-confirmation.route.ts`
- `apps/api/src/routes/v1/orders.route.ts`
- `apps/api/src/routes/v1/payment.route.ts`
- `apps/api/src/routes/v1/auth.route.ts`
- `apps/api/src/routes/v1/profile.route.ts`
- `apps/api/src/routes/v1/ticket-verification.route.ts`
- `apps/api/src/routes/v1/tickets.route.ts`
- `apps/api/src/routes/v1/admin/*.route.ts`

Required middleware:

- `requestIdMiddleware`
- `errorHandler`
- `validateRequest(schema)`
- `resolveParkContext`
- `optionalCustomerAuth`
- `requireCustomerAuth`
- `guestSession`
- `requireAdminAuth`
- `requireAdminPermission(permission)`
- `idempotencyMiddleware`
- `rateLimitAuthEndpoints`
- `auditContextMiddleware`

Shared contracts to add:

- `packages/shared-types/src/common.ts`
- `packages/shared-types/src/home.ts`
- `packages/shared-types/src/purchase.ts`
- `packages/shared-types/src/purchase-content.ts`
- `packages/shared-types/src/order.ts`
- `packages/shared-types/src/payment.ts`
- `packages/shared-types/src/auth.ts`
- `packages/shared-types/src/profile.ts`
- `packages/shared-types/src/tickets.ts`
- `packages/shared-types/src/ticket-verification.ts`
- `packages/shared-types/src/admin.ts`
- `packages/shared-types/src/analytics.ts`

Validation:

- Use the same schema source for runtime validation and TypeScript contracts where practical.
- Prefer `zod` schemas if added to the backend stack.
- Controllers should never trust client-supplied `parkId`, `userId`, `adminId`, prices, or totals without service-layer re-lookup.

## 9. Testing Plan

Contract tests:

- Verify every route response matches `packages/shared-types`.
- Verify common error envelope.

Integration tests:

- Existing customer flows from `docs/specs/backend-services/SVC-*.md`.
- Tenant isolation: same ID in wrong `X-Park-Id` returns `404` or `403`.
- Auth: customer-only endpoints reject guest sessions.
- Admin RBAC: missing permission returns `403`.
- Idempotency: duplicate order/payment submit returns same result.
- Payment webhook: duplicate webhook is safe.

Service unit tests:

- Sales-control capacity calculation and lock behavior.
- Order reservation, release, consume lifecycle.
- Verification pass/fail decisions.
- Password policy and verification-code expiry.
- Audit log write on admin config updates.

## 10. Delivery Phases

Phase 1: API foundation

- Mount `/api/v1`.
- Add common response/error/request-id middleware.
- Add park context and auth/session skeleton.
- Move health route to `/api/v1/health`.

Phase 2: Customer read and auth APIs

- Home, purchase method, guest notice.
- Auth session, login, logout, registration, password reset/change.
- Profile summary.

Phase 3: Purchase, verification, order, payment

- Purchase options/confirm.
- Verification upload/result.
- Order reservation and payment dev-confirm.
- Ticket issuance and QR retrieval.

Phase 4: Admin config and operations

- Admin auth/RBAC.
- Park/ticket config CRUD.
- Order/ticket/user/verification operational lists.
- Audit logging.

Phase 5: Analytics

- Rollup jobs/read models.
- Dashboard endpoints.
- Data freshness metadata and performance checks.

## 11. Open Decisions

1. Confirm production payment providers and webhook signature formats.
2. Confirm ID verification provider and exact retention policy.

Resolved decisions:

- Max 1 ticket per order is global.
- Admin APIs use selected `X-Park-Id` for park-scoped resources.
- Old unversioned `/api/...` routes do not need to remain after `/api/v1` rollout.
