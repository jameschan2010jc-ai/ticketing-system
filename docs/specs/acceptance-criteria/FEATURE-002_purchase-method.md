# Feature Acceptance Criteria: FEATURE-002 Purchase Method

## Feature

`FEATURE-002`

## Inputs

- UI image: `docs/input/ui-images/p2.jpg`, `docs/input/ui-images/PAGE-002_purchase-method-screen.md`
- Function description: `docs/input/function-descriptions/FUNC-002_purchase-method-selection.md`
- Page flow: `docs/input/page-flows/FLOW-002_purchase-method-selection.md`

## Acceptance Criteria

1. Given purchase method page is opened, when page loads, then header and three options are shown.
2. Given user taps existing account login, then user is routed to `/login-existing-account` (p30).
3. Given user taps new account registration, then user is routed to `/register-method` (p40).
4. Given user taps direct purchase, then user is routed to `/purchase-method/guest-notice` (p3).
5. Given user taps Home/Profile icon, then navigation behaves same as p1.

## Non-Functional Criteria

- Performance: page load and interaction feedback complete within 300ms p95 on mobile.
- Accessibility: each method option and icon action is keyboard-focusable and labeled.
- Security: no sensitive user data is displayed on this selection page.

## Test Coverage Mapping

- Unit: `apps/web/tests/unit/purchase-method-page.test.tsx`, `apps/api/tests/unit/purchase-method.service.test.ts`
- Integration: `apps/api/tests/integration/purchase-method-options.test.ts`
- E2E: `apps/web/tests/e2e/purchase-method.spec.ts`
