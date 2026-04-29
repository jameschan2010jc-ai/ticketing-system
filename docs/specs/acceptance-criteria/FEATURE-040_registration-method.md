# Feature Acceptance Criteria: FEATURE-040 Registration Method

## Feature

`FEATURE-040`

## Inputs

- UI image: `docs/input/ui-images/p40.jpg`, `docs/input/ui-images/PAGE-040_registration-method-screen.md`
- Function description: `docs/input/function-descriptions/FUNC-040_registration-method-selection.md`
- Page flow: `docs/input/page-flows/FLOW-040_registration-method-selection.md`

## Acceptance Criteria

1. Given p40 page is opened, then two registration method options are shown.
2. Given user taps phone registration, then user is routed to `/register-phone` (p41).
3. Given user taps email registration, then user is routed to `/register-email` (p42).
4. Given user taps back arrow, then user is returned to `/purchase-method` (p2).
5. Given user taps Home/Profile icon, then navigation behaves same as p1.

## Non-Functional Criteria

- Performance: route transition completes within 300ms p95 on mobile.
- Accessibility: both option cards are keyboard-focusable and screen-reader labeled.
- Security: no personal data is submitted from this page.

## Test Coverage Mapping

- Unit: `apps/web/tests/unit/register-method-page.test.tsx`
- Integration: `apps/api/tests/integration/registration-method-options.test.ts`
- E2E: `apps/web/tests/e2e/register-method.spec.ts`
