# Feature Acceptance Criteria: FEATURE-033 Change Password

## Feature

`FEATURE-033`

## Inputs

- UI image: `docs/input/ui-images/p33.jpg`, `docs/input/ui-images/PAGE-033_change-password-screen.md`
- Function description: `docs/input/function-descriptions/FUNC-033_change-password-from-profile.md`
- Page flow: `docs/input/page-flows/FLOW-033_change-password-from-profile.md`

## Acceptance Criteria

1. Given user opens p33, then account, verification, and password fields are shown.
2. Given valid account and request code action, then verification code is sent.
3. Given valid code and matching valid passwords, then password is updated.
4. Given update succeeds, then user is routed to `/profile-center` (p61).
5. Given validation fails, then error message is shown and user remains on p33.

## Non-Functional Criteria

- Performance: send-code and change-password APIs respond within 1s p95.
- Accessibility: input fields and buttons are keyboard focusable with labels.
- Security: verification code and password policy checks are enforced server-side.

## Test Coverage Mapping

- Unit: `apps/web/tests/unit/change-password-page.test.tsx`, `apps/api/tests/unit/change-password.service.test.ts`
- Integration: `apps/api/tests/integration/change-password.test.ts`
- E2E: `apps/web/tests/e2e/change-password.spec.ts`
