# Backend Service Spec: SVC-030 Existing Account Login

## Service ID

`SVC-030`

## Related Requirements

- `REQ-008`

## Endpoint

- Method: `POST`
- Path: `/api/auth/login-existing-account`

## Request/Response Contract

- Request type: `packages/shared-types/src/auth.ts#LoginExistingAccountRequest`
- Response type: `packages/shared-types/src/auth.ts#LoginExistingAccountResponse`

## Business Rules

1. Validate account identifier (phone or e-mail) and password.
2. Return authenticated session context on success.
3. Return safe error message on failure for p30 lower-area display.

## Error Cases

| Scenario | Status Code | Response |
| --- | --- | --- |
| Invalid credentials | 401 | `{ code: "INVALID_CREDENTIALS", message: string }` |
| Account locked | 423 | `{ code: "ACCOUNT_LOCKED", message: string }` |
| Unexpected error | 500 | `{ code: "INTERNAL_ERROR", message: string }` |

## Implementation Links

- Route: `apps/api/src/routes/auth.route.ts`
- Controller: `apps/api/src/controllers/auth.controller.ts`
- Service: `apps/api/src/services/auth.service.ts`
- Repository: `apps/api/src/repositories/user.repository.ts`
- Tests: `apps/api/tests/unit/auth.service.test.ts`, `apps/api/tests/integration/auth-login-existing-account.test.ts`
