# Backend Service Spec: SVC-003 Guest Purchase Notice Content

## Service ID

`SVC-003`

## Related Requirements

- `REQ-003`

## Endpoint

- Method: `GET`
- Path: `/api/purchase-method/guest-notice`

## Request/Response Contract

- Request type: `None`
- Response type: `packages/shared-types/src/purchase.ts#GuestPurchaseNoticeResponse`

## Business Rules

1. Return notice title and body content for unregistered purchase flow.
2. Content should be versioned so legal text changes can be tracked.
3. Return public content only (no PII).

## Error Cases

| Scenario | Status Code | Response |
| --- | --- | --- |
| Notice content not found | 404 | `{ code: "GUEST_NOTICE_NOT_FOUND", message: string }` |
| Unexpected error | 500 | `{ code: "INTERNAL_ERROR", message: string }` |

## Implementation Links

- Route: `apps/api/src/routes/purchase-method.route.ts`
- Controller: `apps/api/src/controllers/purchase-method.controller.ts`
- Service: `apps/api/src/services/purchase-method.service.ts`
- Repository: `apps/api/src/repositories/purchase-method.repository.ts`
- Tests: `apps/api/tests/unit/purchase-method.service.test.ts`, `apps/api/tests/integration/guest-notice-content.test.ts`
