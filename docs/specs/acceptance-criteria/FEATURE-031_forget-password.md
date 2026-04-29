# Feature Acceptance Criteria: FEATURE-031 Forget Password

## Feature

`FEATURE-031`

## Inputs

- UI image: `docs/input/ui-images/p31.jpg`, `docs/input/ui-images/PAGE-031_forget-password-screen.md`
- Function description: `docs/input/function-descriptions/FUNC-031_forget-password-reset.md`
- Page flow: `docs/input/page-flows/FLOW-031_forget-password-reset.md`

## Acceptance Criteria

1. Given p31 page is opened, then account/code/new-password fields are visible.
2. Given valid account, when user taps send-code, then verification code is sent.
3. Given valid code and matching new passwords, when user taps complete, then user is routed back to `/login-existing-account` (p30).
4. Given invalid code or password mismatch, then user sees error and stays on p31.
5. Given user taps Home/Profile icon, then navigation behaves same as p1.

## Non-Functional Criteria

- Performance: send-code/reset APIs respond within 1s p95.
- Accessibility: form labels, buttons, and validation messages are accessible.
- Security: verification code and reset token checks are enforced server-side.

## Test Coverage Mapping

- Unit: `apps/web/tests/unit/forget-password-page.test.tsx`, `apps/api/tests/unit/auth-forgot-password.service.test.ts`
- Integration: `apps/api/tests/integration/auth-forgot-password-send-code.test.ts`, `apps/api/tests/integration/auth-forgot-password-reset.test.ts`
- E2E: `apps/web/tests/e2e/forget-password.spec.ts`
