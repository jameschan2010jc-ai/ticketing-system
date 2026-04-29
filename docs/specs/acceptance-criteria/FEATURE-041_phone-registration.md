# Feature Acceptance Criteria: FEATURE-041 Phone Registration

## Feature

`FEATURE-041`

## Inputs

- UI image: `docs/input/ui-images/p41.jpg`, `docs/input/ui-images/PAGE-041_phone-registration-screen.md`
- Function description: `docs/input/function-descriptions/FUNC-041_phone-registration.md`
- Page flow: `docs/input/page-flows/FLOW-041_phone-registration.md`

## Acceptance Criteria

1. Given p41 page is opened, then phone input, code input, password fields, and complete button are shown.
2. Given valid phone is entered and send-code is tapped, then system sends SMS verification code.
3. Given valid code and matching valid passwords are submitted, then account is created and user is routed to `/auth-success` (p32).
4. Given code is invalid/expired or password validation fails, then user stays on p41 and sees clear error message.
5. Given user taps Home/Profile icon, then navigation behaves same as p1.

## Non-Functional Criteria

- Performance: send-code and complete-registration APIs respond within 800ms p95 excluding SMS delivery latency.
- Accessibility: all form fields and buttons are labeled and keyboard-focusable.
- Security: verification code is one-time and expires; password is not logged.

## Test Coverage Mapping

- Unit: `apps/web/tests/unit/register-phone-page.test.tsx`, `apps/api/tests/unit/auth-register-phone.service.test.ts`
- Integration: `apps/api/tests/integration/auth-register-phone.test.ts`
- E2E: `apps/web/tests/e2e/register-phone.spec.ts`
