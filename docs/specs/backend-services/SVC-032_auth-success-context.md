# Backend Service Spec: SVC-032 Auth Success Context

## Service ID

`SVC-032`

## Related Requirements

- `REQ-010`

## Endpoint

- Method: `GET`
- Path: `/api/auth/success-context`

## Request/Response Contract

- Request type: `None` (session-bound)
- Response type: `packages/shared-types/src/auth.ts#AuthSuccessContextResponse`

## Business Rules

1. Provide success context for p32 entered from login or registration flow.
2. Include display message and next-route metadata (`/purchase-content`).
3. Reject requests without valid auth/session context.

## Error Cases

| Scenario | Status Code | Response |
| --- | --- | --- |
| Session missing or expired | 401 | `{ code: "AUTH_SESSION_REQUIRED", message: string }` |
| Context not found | 404 | `{ code: "AUTH_SUCCESS_CONTEXT_NOT_FOUND", message: string }` |
| Unexpected error | 500 | `{ code: "INTERNAL_ERROR", message: string }` |

## Implementation Links

- Route: `apps/api/src/routes/auth.route.ts`
- Controller: `apps/api/src/controllers/auth.controller.ts`
- Service: `apps/api/src/services/auth-session.service.ts`
- Repository: `apps/api/src/repositories/session.repository.ts`
- Tests: `apps/api/tests/unit/auth-session.service.test.ts`, `apps/api/tests/integration/auth-success-context.test.ts`
