# Backend Service Spec: SVC-060 Profile Entry Routing

## Service ID

`SVC-060`

## Related Requirements

- `REQ-018`

## Endpoint

- Method: `GET`
- Path: `/api/auth/session-status`

## Request/Response Contract

- Request type: `None`
- Response type: `packages/shared-types/src/auth.ts#SessionStatusResponse`

## Business Rules

1. Return whether current user is authenticated.
2. Provide profile target route hint:
3. not logged in -> `/profile-guest` (p60)
4. logged in -> `/profile-center` (p61)

## Error Cases

| Scenario | Status Code | Response |
| --- | --- | --- |
| Session lookup failed | 500 | `{ code: "SESSION_LOOKUP_FAILED", message: string }` |

## Implementation Links

- Route: `apps/api/src/routes/auth.route.ts`
- Controller: `apps/api/src/controllers/auth.controller.ts`
- Service: `apps/api/src/services/auth-session.service.ts`
- Tests: `apps/api/tests/integration/auth-session-status.test.ts`
