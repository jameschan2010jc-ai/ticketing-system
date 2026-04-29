# Feature Acceptance Criteria: FEATURE-050 Verification Required Order

## Feature

`FEATURE-050`

## Inputs

- UI image: `docs/input/ui-images/p50.jpg`, `docs/input/ui-images/PAGE-050_verification-required-order-screen.md`
- Function description: `docs/input/function-descriptions/FUNC-050_verification-required-order-review.md`
- Page flow: `docs/input/page-flows/FLOW-050_verification-required-order-review.md`

## Acceptance Criteria

1. Given backend marks selected ticket as verification-required, then p50 is displayed after p10 confirm.
2. Given p50 is shown, then selected date/time/ticket information and pending verification status are displayed.
3. Given user taps start verification, then system routes to `/ticket-verification-upload` (p51).
4. Given order context is missing, then system shows clear error and blocks verification start.

## Non-Functional Criteria

- Performance: p50 route transition completes within 300ms p95.
- Accessibility: order summary and start verification button are keyboard focusable and labeled.
- Security: verification-required decision only comes from backend.

## Test Coverage Mapping

- Unit: `apps/web/tests/unit/verification-required-order-page.test.tsx`
- Integration: `apps/api/tests/integration/purchase-content-confirm.test.ts`
- E2E: `apps/web/tests/e2e/verification-required-order.spec.ts`
