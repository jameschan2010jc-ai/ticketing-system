# Feature Acceptance Criteria: FEATURE-013 Payment Success

## Feature

`FEATURE-013`

## Inputs

- UI image: `docs/input/ui-images/p13.jpg`, `docs/input/ui-images/PAGE-013_payment-success-screen.md`
- Function description: `docs/input/function-descriptions/FUNC-013_payment-success-voucher.md`
- Page flow: `docs/input/page-flows/FLOW-013_payment-success-voucher.md`

## Acceptance Criteria

1. Given p13 page is opened, then payment success title and icon are shown.
2. Given page data loads successfully, then order number, visit date, ticket quantity, and QR voucher are shown.
3. Given user taps save-to-phone button, then voucher save action is triggered.
4. Given voucher data is missing, then user sees clear error state.
5. Given user taps Home/Profile icon, then navigation behaves same as p1.

## Non-Functional Criteria

- Performance: success summary API responds within 1s p95.
- Accessibility: QR and key text details remain readable on mobile screens.
- Security: voucher payload is scoped to authorized order/session.

## Test Coverage Mapping

- Unit: `apps/web/tests/unit/payment-success-page.test.tsx`, `apps/api/tests/unit/payment.service.test.ts`
- Integration: `apps/api/tests/integration/payment-success-summary.test.ts`
- E2E: `apps/web/tests/e2e/payment-success.spec.ts`
