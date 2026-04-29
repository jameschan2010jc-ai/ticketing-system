# Backend Service Spec: SVC-041 Phone Registration

## Service ID

`SVC-041`

## Related Requirements

- `REQ-012`

## Endpoints

- Method: `POST`
- Path: `/api/auth/register/phone/send-code`

- Method: `POST`
- Path: `/api/auth/register/phone/complete`

## Request/Response Contract

- Request type:
- `packages/shared-types/src/auth.ts#SendPhoneCodeRequest`
- `packages/shared-types/src/auth.ts#CompletePhoneRegistrationRequest`
- Response type:
- `packages/shared-types/src/auth.ts#SendCodeResponse`
- `packages/shared-types/src/auth.ts#RegistrationCompleteResponse`

## Business Rules

1. Validate phone format before sending SMS code.
2. Verification code is one-time and expires.
3. Password must be 8-20 alphanumeric characters.
4. `password` and `confirmPassword` must match.
5. Successful registration returns auth-success context for p32.

## Error Cases

| Scenario | Status Code | Response |
| --- | --- | --- |
| Invalid phone format | 400 | `{ code: "INVALID_PHONE_FORMAT", message: string }` |
| SMS send failed | 503 | `{ code: "SMS_SEND_FAILED", message: string }` |
| Invalid or expired code | 400 | `{ code: "INVALID_OR_EXPIRED_CODE", message: string }` |
| Password rule violation | 400 | `{ code: "INVALID_PASSWORD_RULE", message: string }` |
| Account already exists | 409 | `{ code: "ACCOUNT_ALREADY_EXISTS", message: string }` |
| Unexpected error | 500 | `{ code: "INTERNAL_ERROR", message: string }` |

## Implementation Links

- Route: `apps/api/src/routes/auth.route.ts`
- Controller: `apps/api/src/controllers/auth.controller.ts`
- Service: `apps/api/src/services/auth-register-phone.service.ts`
- Repository: `apps/api/src/repositories/user.repository.ts`, `apps/api/src/repositories/verification-code.repository.ts`
- Tests: `apps/api/tests/unit/auth-register-phone.service.test.ts`, `apps/api/tests/integration/auth-register-phone.test.ts`
