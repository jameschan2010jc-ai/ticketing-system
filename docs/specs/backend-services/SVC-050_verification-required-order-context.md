# Backend Service Spec: SVC-050 Verification Required Order Context

## Service ID

`SVC-050`

## Related Requirements

- `REQ-014`

## Endpoint

- Method: `GET`
- Path: `/api/ticket-verification/order-context`

## Request/Response Contract

- Request type: `None` (session/order-bound)
- Response type: `packages/shared-types/src/ticket-verification.ts#VerificationRequiredOrderContextResponse`

## Business Rules

1. Return selected date/time/ticket summary and verification-required status for p50.
2. Ensure request is tied to current pending order.
3. Deny access if order does not require verification.

## Error Cases

| Scenario | Status Code | Response |
| --- | --- | --- |
| Order context missing | 404 | `{ code: "ORDER_CONTEXT_NOT_FOUND", message: string }` |
| Verification not required | 400 | `{ code: "VERIFICATION_NOT_REQUIRED", message: string }` |
| Session invalid | 401 | `{ code: "AUTH_SESSION_REQUIRED", message: string }` |
| Unexpected error | 500 | `{ code: "INTERNAL_ERROR", message: string }` |

## Implementation Links

- Route: `apps/api/src/routes/ticket-verification.route.ts`
- Controller: `apps/api/src/controllers/ticket-verification.controller.ts`
- Service: `apps/api/src/services/ticket-verification.service.ts`
- Repository: `apps/api/src/repositories/order.repository.ts`
- Tests: `apps/api/tests/unit/ticket-verification.service.test.ts`, `apps/api/tests/integration/ticket-verification-order-context.test.ts`
