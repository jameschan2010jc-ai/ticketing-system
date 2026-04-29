# Feature Acceptance Criteria: FEATURE-011 Order Confirmation

## Feature

`FEATURE-011`

## Inputs

- UI image: `docs/input/ui-images/p11.jpg`, `docs/input/ui-images/PAGE-011_order-confirmation-screen.md`
- Function description: `docs/input/function-descriptions/FUNC-011_order-confirmation-and-pay.md`
- Page flow: `docs/input/page-flows/FLOW-011_order-confirmation-and-pay.md`

## Acceptance Criteria

1. Given p11 page is opened, then summary sections (date/time/ticket/fee/notice/total) are visible.
2. Given user taps back arrow, then user is returned to `/purchase-content` (p10).
3. Given user taps confirm and pay button with valid summary, then system creates payment session and routes to `/payment-method` (p12).
4. Given summary is expired or changed, then user sees clear message and remains on p11.
5. Given user taps Home/Profile icon, then navigation behaves same as p1.

## Non-Functional Criteria

- Performance: summary API responds within 1s p95.
- Accessibility: summary content and pay button are keyboard accessible with clear focus styles.
- Security: server validates amount and availability before payment initialization.

## Test Coverage Mapping

- Unit: `apps/web/tests/unit/order-confirmation-page.test.tsx`, `apps/api/tests/unit/order-confirmation.service.test.ts`
- Integration: `apps/api/tests/integration/order-confirmation-summary.test.ts`, `apps/api/tests/integration/order-confirm-and-pay.test.ts`
- E2E: `apps/web/tests/e2e/order-confirmation.spec.ts`
