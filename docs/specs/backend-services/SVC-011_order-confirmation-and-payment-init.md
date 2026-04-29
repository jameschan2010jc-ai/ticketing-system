# Backend Service Spec: SVC-011 Order Confirmation and Payment Init

## Service ID

`SVC-011`

## Related Requirements

- `REQ-005`

## Endpoint

- Method: `GET`
- Path: `/api/order-confirmation/summary`

## Request/Response Contract

- Request type: `None`
- Response type: `packages/shared-types/src/order.ts#OrderConfirmationSummaryResponse`

## Business Rules

1. Build summary from latest valid selections in p10.
2. Return visit date/time, ticket info, fee details, notices, and total amount.
3. Expire summary if selection session is stale.
4. On confirm, re-check price and availability before creating payment session.

## Error Cases

| Scenario | Status Code | Response |
| --- | --- | --- |
| Order summary not found | 404 | `{ code: "ORDER_SUMMARY_NOT_FOUND", message: string }` |
| Summary expired | 410 | `{ code: "ORDER_SUMMARY_EXPIRED", message: string }` |
| Price changed on confirm | 409 | `{ code: "PRICE_CHANGED", message: string }` |
| Unexpected error | 500 | `{ code: "INTERNAL_ERROR", message: string }` |

## Implementation Links

- Route: `apps/api/src/routes/order-confirmation.route.ts`
- Controller: `apps/api/src/controllers/order-confirmation.controller.ts`
- Service: `apps/api/src/services/order-confirmation.service.ts`
- Repository: `apps/api/src/repositories/order.repository.ts`
- Tests: `apps/api/tests/unit/order-confirmation.service.test.ts`, `apps/api/tests/integration/order-confirmation-summary.test.ts`, `apps/api/tests/integration/order-confirm-and-pay.test.ts`
