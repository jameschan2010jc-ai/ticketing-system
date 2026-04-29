# Backend Service Spec: SVC-063 My Tickets and QR Code

## Service ID

`SVC-063`

## Related Requirements

- `REQ-021`

## Endpoints

- Method: `GET`
- Path: `/api/tickets/my?status=unused`

- Method: `GET`
- Path: `/api/tickets/{ticketId}/qr`

## Request/Response Contract

- Request type: `None` (session-bound)
- Response type:
- `packages/shared-types/src/tickets.ts#MyTicketsResponse`
- `packages/shared-types/src/tickets.ts#TicketQrResponse`

## Business Rules

1. Return only unused tickets owned by current user.
2. QR code can be generated/read only for valid unused tickets.
3. Reject cross-user ticket access.

## Error Cases

| Scenario | Status Code | Response |
| --- | --- | --- |
| Unauthorized | 401 | `{ code: "AUTH_REQUIRED", message: string }` |
| Ticket not found | 404 | `{ code: "TICKET_NOT_FOUND", message: string }` |
| QR unavailable | 422 | `{ code: "QR_UNAVAILABLE", message: string }` |

## Implementation Links

- Route: `apps/api/src/routes/tickets.route.ts`
- Controller: `apps/api/src/controllers/tickets.controller.ts`
- Service: `apps/api/src/services/tickets.service.ts`
- Tests: `apps/api/tests/integration/tickets-my-unused.test.ts`, `apps/api/tests/integration/tickets-qr.test.ts`
