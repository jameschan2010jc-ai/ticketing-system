# Backend Service Spec: SVC-062 My Orders List

## Service ID

`SVC-062`

## Related Requirements

- `REQ-020`

## Endpoint

- Method: `GET`
- Path: `/api/orders/my`

## Request/Response Contract

- Request type: `None` (session-bound)
- Response type: `packages/shared-types/src/orders.ts#MyOrdersResponse`

## Business Rules

1. Return only orders belonging to current authenticated user.
2. Include order number, purchase date, payment/usage status.
3. Support paging for long order lists.

## Error Cases

| Scenario | Status Code | Response |
| --- | --- | --- |
| Unauthorized | 401 | `{ code: "AUTH_REQUIRED", message: string }` |
| No records | 200 | `{ orders: [] }` |
| Unexpected error | 500 | `{ code: "INTERNAL_ERROR", message: string }` |

## Implementation Links

- Route: `apps/api/src/routes/orders.route.ts`
- Controller: `apps/api/src/controllers/orders.controller.ts`
- Service: `apps/api/src/services/orders.service.ts`
- Tests: `apps/api/tests/integration/orders-my-list.test.ts`
