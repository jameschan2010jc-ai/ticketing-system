# Project Working Summary

## 1. Completed Work

- Established project stack and structure around:
- Frontend: React + Tailwind
- Backend: Node.js + Express + TypeScript

- Built and continuously updated input/spec coverage for customer purchase journey pages:
- Homepage, purchase method, guest flow
- Purchase content, order confirmation, payment method, payment success
- Existing account login, registration (phone/email), forgot/change password
- Verification-required ticket flow (p50-p53)
- Profile center and post-login pages (p60-p64, p33)

- Created/updated linked documentation sets for each page/flow:
- `docs/input/ui-images/*`
- `docs/input/function-descriptions/*`
- `docs/input/page-flows/*`
- `docs/specs/frontend-pages/*`
- `docs/specs/acceptance-criteria/*`
- `docs/specs/backend-services/*`

- Updated traceability matrix through latest requirement IDs:
- `REQ-001` to `REQ-023`

- Reviewed external product spec file:
- `docs/specs/景區智慧閘機產品流程詳述企劃書20260407_James.docx`
- Compared Chapter 1-3 against backend plan
- Excluded Chapter 4 gate-machine integration details (as requested)

- Produced backend architecture artifacts:
- `docs/architecture/backend-design-plan.md`
- `docs/architecture/backend-ch1-3-alignment-review.md`
- `docs/architecture/backend-data-organization.md`

## 2. Current Architecture Decisions

- Multi-park architecture model:
- Single backend platform with strict tenant isolation by `park_id`.

- Identity model:
- User account identity is centrally managed.
- Orders/tickets are park-scoped.

- Purchase branching:
- From purchase content (p10), backend decides next route by verification-required rule.

- Sales control rules:
- Daily cap (by visit date)
- Period total cap (by sales period)
- Composite cap rule (smaller remaining wins)
- Oversell prevention via transactional control/reservation

- Guest vs registered:
- Guest purchase allowed, data stored for operations/statistics.
- Guest has no long-term account binding and limited self-service functions.

- Verification flow:
- Verification result records are stored.
- No manual review queue in current scope.

- Profile routing by auth state:
- Profile icon -> p60 when logged out; p61 when logged in.

## 3. Open Questions / Risks

- Quantity rule ambiguity in external spec:
- Ch1 revision note implies global single-ticket limit.
- Ch2.7 limits single-ticket rule to verification-required discount tickets.
- Current project baseline uses max 1 ticket per order; business confirmation still needed.

- DB topology decision pending:
- Multiple logical MySQL databases (`park_config_db`, `account_db`, `commerce_db`) vs one database with prefixed table groups.

- Payment integration depth currently staged:
- Current flow docs still include “skip real payment” behavior in some areas.
- Final payment reconciliation model and timeout/retry semantics need firm definition.

- Gate integration deferred:
- Chapter 4 is out of scope now; backend fields/events are prepared but full device protocol is pending third party.

## 4. Next Actionable Tasks

1. Create backend API catalog:
- `docs/architecture/backend-api-catalog.md`
- Include endpoint purpose, auth scope, tenant scope, request/response DTO outlines.

2. Create admin capability-to-API map:
- `docs/architecture/admin-web-capability-map.md`

3. Create KPI definition document:
- `docs/architecture/analytics-kpi-definition.md`

4. Convert data organization proposal into executable schema artifacts:
- ERD + migration plan (table creation order, indexes, constraints)

5. Resolve quantity-rule ambiguity with business owner and update affected docs consistently.

## 5. Key File Map

- Backend design plan:
- `docs/architecture/backend-design-plan.md`

- Chapter 1-3 mismatch review:
- `docs/architecture/backend-ch1-3-alignment-review.md`

- Database organization proposal:
- `docs/architecture/backend-data-organization.md`

- Requirements traceability:
- `docs/specs/requirements-traceability.md`

- Input artifacts root:
- `docs/input/ui-images/`
- `docs/input/function-descriptions/`
- `docs/input/page-flows/`

- Delivery specs root:
- `docs/specs/frontend-pages/`
- `docs/specs/acceptance-criteria/`
- `docs/specs/backend-services/`
