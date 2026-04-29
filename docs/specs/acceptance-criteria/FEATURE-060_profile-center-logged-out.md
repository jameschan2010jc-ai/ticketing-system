# Feature Acceptance Criteria: FEATURE-060 Profile Center Logged-out

## Feature

`FEATURE-060`

## Inputs

- UI image: `docs/input/ui-images/p60.jpg`, `docs/input/ui-images/PAGE-060_profile-center-logged-out-screen.md`
- Function description: `docs/input/function-descriptions/FUNC-060_profile-center-entry-logged-out.md`
- Page flow: `docs/input/page-flows/FLOW-060_profile-entry-logged-out.md`

## Acceptance Criteria

1. Given user is not logged in and taps bottom Profile icon, then system routes to `/profile-guest` (p60).
2. Given p60 is shown, then login and register actions are visible.
3. Given user taps login, then user is routed to `/login-existing-account` (p30).
4. Given user taps register, then user is routed to `/register-method` (p40).

## Non-Functional Criteria

- Performance: profile entry route resolves within 300ms p95.
- Accessibility: login/register actions and list items are keyboard-focusable and labeled.
- Security: page does not expose private user data when logged out.

## Test Coverage Mapping

- Unit: `apps/web/tests/unit/profile-guest-page.test.tsx`
- Integration: `apps/api/tests/integration/auth-session-status.test.ts`
- E2E: `apps/web/tests/e2e/profile-guest.spec.ts`
