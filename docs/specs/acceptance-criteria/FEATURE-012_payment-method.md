# Feature Acceptance Criteria: FEATURE-012 Payment Method

## Feature

`FEATURE-012`

## Inputs

- UI image: `docs/input/ui-images/p12.jpg`, `docs/input/ui-images/PAGE-012_payment-method-screen.md`
- Function description: `docs/input/function-descriptions/FUNC-012_payment-method-selection.md`
- Page flow: `docs/input/page-flows/FLOW-012_payment-method-selection.md`

## Acceptance Criteria

1. Given p12 page is opened, then credit-card and LINE PAY options are visible.
2. Given user taps one payment method, then selected method is recorded.
3. Given current development mode, when method is selected, then system routes directly to `/payment-success` (p13).
4. Given method list cannot load, then user sees clear error feedback.
5. Given user taps Home/Profile icon, then navigation behaves same as p1.

## Non-Functional Criteria

- Performance: payment method options load within 1s p95.
- Accessibility: method options are keyboard focusable with clear labels.
- Security: selected payment method is validated server-side.

## Test Coverage Mapping

- Unit: `apps/web/tests/unit/payment-method-page.test.tsx`, `apps/api/tests/unit/payment.service.test.ts`
- Integration: `apps/api/tests/integration/payment-method-selection.test.ts`
- E2E: `apps/web/tests/e2e/payment-method.spec.ts`
