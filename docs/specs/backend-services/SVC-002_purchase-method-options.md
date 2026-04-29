# Backend Service Spec: SVC-002 Purchase Method Options

## Service ID

`SVC-002`

## Related Requirements

- `REQ-002`

## Endpoint

- Method: `GET`
- Path: `/api/purchase-method/options`

## Request/Response Contract

- Request type: `None`
- Response type: `packages/shared-types/src/purchase.ts#PurchaseMethodOptionsResponse`

## Business Rules

1. Return configuration for available purchase methods on p2.
2. Keep existing-account-login, new-account-registration, and direct-purchase enabled.
3. Provide route targets for each option.

## Error Cases

| Scenario | Status Code | Response |
| --- | --- | --- |
| Config not found | 404 | `{ code: "PURCHASE_METHOD_CONFIG_NOT_FOUND", message: string }` |
| Unexpected error | 500 | `{ code: "INTERNAL_ERROR", message: string }` |

## Implementation Links

- Route: `apps/api/src/routes/purchase-method.route.ts`
- Controller: `apps/api/src/controllers/purchase-method.controller.ts`
- Service: `apps/api/src/services/purchase-method.service.ts`
- Repository: `apps/api/src/repositories/purchase-method.repository.ts`
- Tests: `apps/api/tests/unit/purchase-method.service.test.ts`, `apps/api/tests/integration/purchase-method-options.test.ts`
