# Feature Acceptance Criteria: FEATURE-032 Auth Success

## Feature

`FEATURE-032`

## Inputs

- UI image: `docs/input/ui-images/p32.jpg`, `docs/input/ui-images/PAGE-032_auth-success-screen.md`
- Function description: `docs/input/function-descriptions/FUNC-032_auth-success-continue.md`
- Page flow: `docs/input/page-flows/FLOW-032_auth-success-continue.md`

## Acceptance Criteria

1. Given p32 page is opened after login or registration success, then success message and continue button are shown.
2. Given user taps continue button, then user is routed to `/purchase-content` (p10).
3. Given auth success context is missing, then user sees error and cannot continue.
4. Given user taps Home/Profile icon, then navigation behaves same as p1.

## Non-Functional Criteria

- Performance: continue action route transition completes within 300ms p95.
- Accessibility: success text and continue button are clearly readable and keyboard focusable.
- Security: page requires valid authenticated session context.

## Test Coverage Mapping

- Unit: `apps/web/tests/unit/auth-success-page.test.tsx`, `apps/api/tests/unit/auth-session.service.test.ts`
- Integration: `apps/api/tests/integration/auth-success-context.test.ts`
- E2E: `apps/web/tests/e2e/auth-success.spec.ts`
