# Feature Acceptance Criteria: FEATURE-003 Guest Purchase Notice

## Feature

`FEATURE-003`

## Inputs

- UI image: `docs/input/ui-images/p3.pdf`, `docs/input/ui-images/PAGE-003_guest-purchase-notice-screen.md`
- Function description: `docs/input/function-descriptions/FUNC-003_guest-purchase-notice-ack.md`
- Page flow: `docs/input/page-flows/FLOW-003_guest-purchase-notice.md`

## Acceptance Criteria

1. Given guest notice page is opened, then notice title/body are visible.
2. Given acknowledgement checkbox is unchecked, then continue purchase button is disabled.
3. Given acknowledgement checkbox is checked, then continue purchase button is enabled.
4. Given user taps continue purchase while enabled, then user is routed to `/purchase-content` (p10).
5. Given user taps Home/Profile icon, then navigation behaves same as p1.

## Non-Functional Criteria

- Performance: checkbox toggle and button state update happen instantly on client side.
- Accessibility: checkbox and continue button have accessible labels and focus states.
- Security: notice content endpoint returns public text only.

## Test Coverage Mapping

- Unit: `apps/web/tests/unit/guest-notice-page.test.tsx`, `apps/api/tests/unit/purchase-method.service.test.ts`
- Integration: `apps/api/tests/integration/guest-notice-content.test.ts`
- E2E: `apps/web/tests/e2e/guest-notice.spec.ts`

