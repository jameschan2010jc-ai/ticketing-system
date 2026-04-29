# Backend Service Spec: SVC-064 My Tickets History

## Service ID

`SVC-064`

## Related Requirements

- `REQ-022`

## Endpoint

- Method: `GET`
- Path: `/api/tickets/my?status=used`

## Request/Response Contract

- Request type: `None` (session-bound)
- Response type: `packages/shared-types/src/tickets.ts#MyTicketsResponse`

## Business Rules

1. Return used ticket history belonging to current user.
2. Include date, quantity, and used status.
3. Support paging for long history lists.

## Error Cases

| Scenario | Status Code | Response |
| --- | --- | --- |
| Unauthorized | 401 | `{ code: "AUTH_REQUIRED", message: string }` |
| No records | 200 | `{ tickets: [] }` |
| Unexpected error | 500 | `{ code: "INTERNAL_ERROR", message: string }` |

## Implementation Links

- Route: `apps/api/src/routes/tickets.route.ts`
- Controller: `apps/api/src/controllers/tickets.controller.ts`
- Service: `apps/api/src/services/tickets.service.ts`
- Tests: `apps/api/tests/integration/tickets-my-history.test.ts`
