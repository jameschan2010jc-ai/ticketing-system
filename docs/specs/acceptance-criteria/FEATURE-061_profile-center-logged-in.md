# Feature Acceptance Criteria: FEATURE-061 Profile Center Logged-in

## Feature

`FEATURE-061`

## Inputs

- UI image: `docs/input/ui-images/p61.jpg`, `docs/input/ui-images/PAGE-061_profile-center-logged-in-screen.md`
- Function description: `docs/input/function-descriptions/FUNC-061_profile-center-menu-logged-in.md`
- Page flow: `docs/input/page-flows/FLOW-061_profile-center-logged-in.md`

## Acceptance Criteria

1. Given user is logged in and taps bottom Profile icon, then system routes to `/profile-center` (p61).
2. Given p61 is shown, then user info and menu options are visible.
3. Given user selects My orders, then route to `/my-orders` (p62).
4. Given user selects My tickets, then route to `/my-tickets` (p63).
5. Given user selects Change password, then route to `/change-password` (p33).
6. Given user selects Logout, then session is cleared and route to `/` (p1).

## Non-Functional Criteria

- Performance: profile summary API responds within 800ms p95.
- Accessibility: menu options are keyboard-focusable and clearly labeled.
- Security: p61 requires valid authenticated session.

## Test Coverage Mapping

- Unit: `apps/web/tests/unit/profile-center-page.test.tsx`, `apps/api/tests/unit/profile.service.test.ts`
- Integration: `apps/api/tests/integration/profile-summary.test.ts`, `apps/api/tests/integration/auth-logout.test.ts`
- E2E: `apps/web/tests/e2e/profile-center.spec.ts`
