# Feature Acceptance Criteria: FEATURE-062 My Orders

## Feature

`FEATURE-062`

## Inputs

- UI image: `docs/input/ui-images/p62.jpg`, `docs/input/ui-images/PAGE-062_my-orders-screen.md`
- Function description: `docs/input/function-descriptions/FUNC-062_my-orders-list.md`
- Page flow: `docs/input/page-flows/FLOW-062_my-orders.md`

## Acceptance Criteria

1. Given logged-in user opens My orders, then order list is displayed with order number, date, and status.
2. Given no orders exist, then empty state is shown.
3. Given API failure, then clear error feedback is shown with retry behavior.

## Non-Functional Criteria

- Performance: orders API responds within 1s p95.
- Accessibility: order cards and status labels are readable and keyboard reachable.
- Security: only current user orders are returned.

## Test Coverage Mapping

- Unit: `apps/web/tests/unit/my-orders-page.test.tsx`, `apps/api/tests/unit/orders.service.test.ts`
- Integration: `apps/api/tests/integration/orders-my-list.test.ts`
- E2E: `apps/web/tests/e2e/my-orders.spec.ts`
