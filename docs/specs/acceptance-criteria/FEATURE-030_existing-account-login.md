# Feature Acceptance Criteria: FEATURE-030 Existing Account Login

## Feature

`FEATURE-030`

## Inputs

- UI image: `docs/input/ui-images/p30.jpg`, `docs/input/ui-images/PAGE-030_existing-login-screen.md`
- Function description: `docs/input/function-descriptions/FUNC-030_existing-account-login.md`
- Page flow: `docs/input/page-flows/FLOW-030_existing-account-login.md`

## Acceptance Criteria

1. Given p30 page is opened, then account/password inputs and login button are visible.
2. Given valid account/password, when user taps login, then user is routed to `/auth-success` (p32).
3. Given invalid account/password, when user taps login, then error message is shown in lower page area and user stays on p30.
4. Given user taps forget-password link, then user is routed to `/forget-password` (p31).
5. Given user taps Home/Profile icon, then navigation behaves same as p1.

## Non-Functional Criteria

- Performance: login API responds within 800ms p95.
- Accessibility: input fields and error message are screen-reader accessible.
- Security: passwords are never logged; auth checks are server-side.

## Test Coverage Mapping

- Unit: `apps/web/tests/unit/login-existing-account-page.test.tsx`, `apps/api/tests/unit/auth.service.test.ts`
- Integration: `apps/api/tests/integration/auth-login-existing-account.test.ts`
- E2E: `apps/web/tests/e2e/login-existing-account.spec.ts`
