# Backend Service Spec: SVC-033 Change Password from Profile

## Service ID

`SVC-033`

## Related Requirements

- `REQ-023`

## Endpoints

- Method: `POST`
- Path: `/api/auth/change-password/send-code`

- Method: `POST`
- Path: `/api/auth/change-password/complete`

## Request/Response Contract

- Request type:
- `packages/shared-types/src/auth.ts#ChangePasswordSendCodeRequest`
- `packages/shared-types/src/auth.ts#ChangePasswordCompleteRequest`
- Response type:
- `packages/shared-types/src/auth.ts#SendCodeResponse`
- `packages/shared-types/src/auth.ts#ChangePasswordCompleteResponse`

## Business Rules

1. Verify account ownership before issuing verification code.
2. Verification code is one-time and expires.
3. New password must satisfy policy and differ from old password.
4. On success, keep user authenticated and return success for p61 redirect.

## Error Cases

| Scenario | Status Code | Response |
| --- | --- | --- |
| Invalid account | 404 | `{ code: "ACCOUNT_NOT_FOUND", message: string }` |
| Invalid/expired code | 400 | `{ code: "INVALID_OR_EXPIRED_CODE", message: string }` |
| Password policy violation | 400 | `{ code: "INVALID_PASSWORD_RULE", message: string }` |
| Unexpected error | 500 | `{ code: "INTERNAL_ERROR", message: string }` |

## Implementation Links

- Route: `apps/api/src/routes/auth.route.ts`
- Controller: `apps/api/src/controllers/auth.controller.ts`
- Service: `apps/api/src/services/change-password.service.ts`
- Tests: `apps/api/tests/unit/change-password.service.test.ts`, `apps/api/tests/integration/change-password.test.ts`
