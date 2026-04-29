# Backend Service Spec: SVC-013 Payment Success Voucher

## Service ID

`SVC-013`

## Related Requirements

- `REQ-007`

## Endpoint

- Method: `GET`
- Path: `/api/payment/success-summary`

## Request/Response Contract

- Request type: `None`
- Response type: `packages/shared-types/src/payment.ts#PaymentSuccessSummaryResponse`

## Business Rules

1. Return payment success details (order number, date/time, quantity).
2. Return QR code voucher payload and ticket status.
3. Ensure data belongs to current user/session context.

## Error Cases

| Scenario | Status Code | Response |
| --- | --- | --- |
| Success summary not found | 404 | `{ code: "PAYMENT_SUCCESS_NOT_FOUND", message: string }` |
| Voucher unavailable | 404 | `{ code: "VOUCHER_NOT_FOUND", message: string }` |
| Unexpected error | 500 | `{ code: "INTERNAL_ERROR", message: string }` |

## Implementation Links

- Route: `apps/api/src/routes/payment.route.ts`
- Controller: `apps/api/src/controllers/payment.controller.ts`
- Service: `apps/api/src/services/payment.service.ts`
- Repository: `apps/api/src/repositories/payment.repository.ts`
- Tests: `apps/api/tests/unit/payment.service.test.ts`, `apps/api/tests/integration/payment-success-summary.test.ts`
