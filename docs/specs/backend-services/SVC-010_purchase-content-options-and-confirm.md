# Backend Service Spec: SVC-010 Purchase Content Options and Confirm

## Service ID

`SVC-010`

## Related Requirements

- `REQ-004`

## Endpoints

- Method: `GET`
- Path: `/api/purchase-content/options`

- Method: `POST`
- Path: `/api/purchase-content/confirm`

## Request/Response Contract

- Request type:
- `None` for options
- `packages/shared-types/src/purchase-content.ts#PurchaseContentConfirmRequest` for confirm
- Response type:
- `packages/shared-types/src/purchase-content.ts#PurchaseContentOptionsResponse`
- `packages/shared-types/src/purchase-content.ts#PurchaseContentConfirmResponse`

## Business Rules

1. Return available visit dates based on sales calendar and capacity.
2. Return available time slots for selected date.
3. Return available ticket types with max purchase rule (1 ticket).
4. Exclude unavailable/sold-out options.
5. On confirm, determine `requiresIdVerification` based on selected ticket type rules.
6. If `requiresIdVerification = true`, set next step to p50 flow context.
7. If `requiresIdVerification = false`, set next step to existing p11 flow context.

## Error Cases

| Scenario | Status Code | Response |
| --- | --- | --- |
| No options available | 404 | `{ code: "PURCHASE_OPTIONS_NOT_FOUND", message: string }` |
| Validation fail | 400 | `{ code: "VALIDATION_ERROR", message: string }` |
| Ticket no longer available | 409 | `{ code: "TICKET_NOT_AVAILABLE", message: string }` |
| Unexpected error | 500 | `{ code: "INTERNAL_ERROR", message: string }` |

## Implementation Links

- Route: `apps/api/src/routes/purchase-content.route.ts`
- Controller: `apps/api/src/controllers/purchase-content.controller.ts`
- Service: `apps/api/src/services/purchase-content.service.ts`
- Repository: `apps/api/src/repositories/purchase-content.repository.ts`
- Tests: `apps/api/tests/unit/purchase-content.service.test.ts`, `apps/api/tests/integration/purchase-content-options.test.ts`, `apps/api/tests/integration/purchase-content-confirm.test.ts`
