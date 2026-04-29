# Backend Service Spec: SVC-042 Email Registration

## Service ID

`SVC-042`

## Related Requirements

- `REQ-013`

## Endpoints

- Method: `POST`
- Path: `/api/auth/register/email/send-code`

- Method: `POST`
- Path: `/api/auth/register/email/complete`

## Request/Response Contract

- Request type:
- `packages/shared-types/src/auth.ts#SendEmailCodeRequest`
- `packages/shared-types/src/auth.ts#CompleteEmailRegistrationRequest`
- Response type:
- `packages/shared-types/src/auth.ts#SendCodeResponse`
- `packages/shared-types/src/auth.ts#RegistrationCompleteResponse`

## Business Rules

1. Validate email format before sending verification code.
2. Verification code is one-time and expires.
3. Password must be 8-20 alphanumeric characters.
4. `password` and `confirmPassword` must match.
5. Successful registration returns auth-success context for p32.

## Error Cases

| Scenario | Status Code | Response |
| --- | --- | --- |
| Invalid email format | 400 | `{ code: "INVALID_EMAIL_FORMAT", message: string }` |
| Verification email send failed | 503 | `{ code: "EMAIL_SEND_FAILED", message: string }` |
| Invalid or expired code | 400 | `{ code: "INVALID_OR_EXPIRED_CODE", message: string }` |
| Password rule violation | 400 | `{ code: "INVALID_PASSWORD_RULE", message: string }` |
| Account already exists | 409 | `{ code: "ACCOUNT_ALREADY_EXISTS", message: string }` |
| Unexpected error | 500 | `{ code: "INTERNAL_ERROR", message: string }` |

## Implementation Links

- Route: `apps/api/src/routes/auth.route.ts`
- Controller: `apps/api/src/controllers/auth.controller.ts`
- Service: `apps/api/src/services/auth-register-email.service.ts`
- Repository: `apps/api/src/repositories/user.repository.ts`, `apps/api/src/repositories/verification-code.repository.ts`
- Tests: `apps/api/tests/unit/auth-register-email.service.test.ts`, `apps/api/tests/integration/auth-register-email.test.ts`
