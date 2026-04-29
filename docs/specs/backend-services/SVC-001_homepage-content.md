# Backend Service Spec: SVC-001 Homepage Content

## Service ID

`SVC-001`

## Related Requirements

- `REQ-001`

## Endpoint

- Method: `GET`
- Path: `/api/home-content`

## Request/Response Contract

- Request type: `None`
- Response type: `packages/shared-types/src/home.ts#HomeContentResponse`

## Business Rules

1. Return homepage display data for current active park/campaign.
2. Include `parkName`, `parkImageUrl`, `parkIntro`, `openDateRange`, and `ticketPriceInfo`.
3. Return only public content required for homepage rendering.

## Error Cases

| Scenario | Status Code | Response |
| --- | --- | --- |
| Content not configured | 404 | `{ code: "HOME_CONTENT_NOT_FOUND", message: string }` |
| Unexpected error | 500 | `{ code: "INTERNAL_ERROR", message: string }` |

## Implementation Links

- Route: `apps/api/src/routes/home.route.ts`
- Controller: `apps/api/src/controllers/home.controller.ts`
- Service: `apps/api/src/services/home-content.service.ts`
- Repository: `apps/api/src/repositories/home-content.repository.ts`
- Tests: `apps/api/tests/unit/home-content.service.test.ts`, `apps/api/tests/integration/home-content.test.ts`
