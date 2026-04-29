# Feature Acceptance Criteria: FEATURE-042 Email Registration

## Feature

`FEATURE-042`

## Inputs

- UI image: `docs/input/ui-images/p42.jpg`, `docs/input/ui-images/PAGE-042_email-registration-screen.md`
- Function description: `docs/input/function-descriptions/FUNC-042_email-registration.md`
- Page flow: `docs/input/page-flows/FLOW-042_email-registration.md`

## Acceptance Criteria

1. Given p42 page is opened, then email input, code input, password fields, and complete button are shown.
2. Given valid email is entered and send-code is tapped, then system sends verification code email.
3. Given valid code and matching valid passwords are submitted, then account is created and user is routed to `/auth-success` (p32).
4. Given code is invalid/expired or password validation fails, then user stays on p42 and sees clear error message.
5. Given user taps Home/Profile icon, then navigation behaves same as p1.

## Non-Functional Criteria

- Performance: send-code and complete-registration APIs respond within 800ms p95 excluding email delivery latency.
- Accessibility: all form fields and buttons are labeled and keyboard-focusable.
- Security: verification code is one-time and expires; password is not logged.

## Test Coverage Mapping

- Unit: `apps/web/tests/unit/register-email-page.test.tsx`, `apps/api/tests/unit/auth-register-email.service.test.ts`
- Integration: `apps/api/tests/integration/auth-register-email.test.ts`
- E2E: `apps/web/tests/e2e/register-email.spec.ts`
