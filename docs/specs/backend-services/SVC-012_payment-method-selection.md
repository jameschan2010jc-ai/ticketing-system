# Backend Service Spec: SVC-012 Payment Method Selection

## Service ID

`SVC-012`

## Related Requirements

- `REQ-006`

## Endpoint

- Method: `GET`
- Path: `/api/payment/methods`

## Request/Response Contract

- Request type: `None`
- Response type: `packages/shared-types/src/payment.ts#PaymentMethodListResponse`

## Business Rules

1. Return currently enabled payment methods (for now: credit card and LINE PAY).
2. Accept selected method and bind it to current order context.
3. Current development behavior: skip real payment processing and return success route target p13.

## Error Cases

| Scenario | Status Code | Response |
| --- | --- | --- |
| Payment method config missing | 404 | `{ code: "PAYMENT_METHODS_NOT_FOUND", message: string }` |
| Invalid method selected | 400 | `{ code: "INVALID_PAYMENT_METHOD", message: string }` |
| Unexpected error | 500 | `{ code: "INTERNAL_ERROR", message: string }` |

## Implementation Links

- Route: `apps/api/src/routes/payment.route.ts`
- Controller: `apps/api/src/controllers/payment.controller.ts`
- Service: `apps/api/src/services/payment.service.ts`
- Repository: `apps/api/src/repositories/payment.repository.ts`
- Tests: `apps/api/tests/unit/payment.service.test.ts`, `apps/api/tests/integration/payment-method-selection.test.ts`
