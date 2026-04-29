# Backend Service Spec: SVC-061 Profile Summary and Logout

## Service ID

`SVC-061`

## Related Requirements

- `REQ-019`

## Endpoints

- Method: `GET`
- Path: `/api/profile/summary`

- Method: `POST`
- Path: `/api/auth/logout`

## Request/Response Contract

- Request type: `None` (session-bound)
- Response type:
- `packages/shared-types/src/profile.ts#ProfileSummaryResponse`
- `packages/shared-types/src/auth.ts#LogoutResponse`

## Business Rules

1. Return user display name/contact and login status for p61.
2. Logout clears server session/token and client auth context.
3. After logout, profile entry resolves to p60.

## Error Cases

| Scenario | Status Code | Response |
| --- | --- | --- |
| Unauthorized | 401 | `{ code: "AUTH_REQUIRED", message: string }` |
| Logout failed | 500 | `{ code: "LOGOUT_FAILED", message: string }` |

## Implementation Links

- Route: `apps/api/src/routes/profile.route.ts`, `apps/api/src/routes/auth.route.ts`
- Controller: `apps/api/src/controllers/profile.controller.ts`, `apps/api/src/controllers/auth.controller.ts`
- Service: `apps/api/src/services/profile.service.ts`, `apps/api/src/services/auth-session.service.ts`
- Tests: `apps/api/tests/integration/profile-summary.test.ts`, `apps/api/tests/integration/auth-logout.test.ts`
