# Backend Service Spec: SVC-052 Ticket Verification Result Context

## Service ID

`SVC-052`

## Related Requirements

- `REQ-016`
- `REQ-017`

## Endpoint

- Method: `GET`
- Path: `/api/ticket-verification/result-context`

## Request/Response Contract

- Request type: `None` (session/order-bound)
- Response type: `packages/shared-types/src/ticket-verification.ts#VerificationResultContextResponse`

## Business Rules

1. Return latest verification result for pending order.
2. If status is `valid`, provide success message and next route `/payment-method`.
3. If status is `invalid`, provide failure reasons and retry route `/ticket-verification-upload`.
4. Ensure user can only access own verification result.

## Error Cases

| Scenario | Status Code | Response |
| --- | --- | --- |
| Result not found | 404 | `{ code: "VERIFICATION_RESULT_NOT_FOUND", message: string }` |
| Session invalid | 401 | `{ code: "AUTH_SESSION_REQUIRED", message: string }` |
| Unexpected error | 500 | `{ code: "INTERNAL_ERROR", message: string }` |

## Implementation Links

- Route: `apps/api/src/routes/ticket-verification.route.ts`
- Controller: `apps/api/src/controllers/ticket-verification.controller.ts`
- Service: `apps/api/src/services/ticket-verification.service.ts`
- Repository: `apps/api/src/repositories/ticket-verification.repository.ts`
- Tests: `apps/api/tests/unit/ticket-verification.service.test.ts`, `apps/api/tests/integration/ticket-verification-result-context.test.ts`
