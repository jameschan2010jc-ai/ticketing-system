# Backend Service Spec: SVC-031 Forget Password Reset

## Service ID

`SVC-031`

## Related Requirements

- `REQ-009`

## Endpoint

- Method: `POST`
- Path: `/api/auth/forgot-password/reset`

## Request/Response Contract

- Request type: `packages/shared-types/src/auth.ts#ForgotPasswordResetRequest`
- Response type: `packages/shared-types/src/auth.ts#ForgotPasswordResetResponse`

## Business Rules

1. Verify account and verification code.
2. Validate new password policy and confirm-password match.
3. Update password and invalidate old login sessions as needed.
4. Return success response that routes user back to p30.

## Error Cases

| Scenario | Status Code | Response |
| --- | --- | --- |
| Invalid or expired code | 400 | `{ code: "INVALID_OR_EXPIRED_CODE", message: string }` |
| Password policy fail | 400 | `{ code: "PASSWORD_POLICY_ERROR", message: string }` |
| Account not found | 404 | `{ code: "ACCOUNT_NOT_FOUND", message: string }` |
| Unexpected error | 500 | `{ code: "INTERNAL_ERROR", message: string }` |

## Implementation Links

- Route: `apps/api/src/routes/auth.route.ts`
- Controller: `apps/api/src/controllers/auth.controller.ts`
- Service: `apps/api/src/services/auth-forgot-password.service.ts`
- Repository: `apps/api/src/repositories/user.repository.ts`
- Tests: `apps/api/tests/unit/auth-forgot-password.service.test.ts`, `apps/api/tests/integration/auth-forgot-password-reset.test.ts`
