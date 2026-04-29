# Backend Service Spec: SVC-040 Registration Method Options

## Service ID

`SVC-040`

## Related Requirements

- `REQ-011`

## Endpoint

- Method: `GET`
- Path: `/api/auth/register/methods`

## Request/Response Contract

- Request type: `None`
- Response type: `packages/shared-types/src/auth.ts#RegistrationMethodOptionsResponse`

## Business Rules

1. Return two supported registration methods: `phone` and `email`.
2. Include route hints for p41 and p42.
3. Allow feature-flag toggling each registration method.

## Error Cases

| Scenario | Status Code | Response |
| --- | --- | --- |
| Config not found | 404 | `{ code: "REGISTRATION_METHOD_CONFIG_NOT_FOUND", message: string }` |
| Unexpected error | 500 | `{ code: "INTERNAL_ERROR", message: string }` |

## Implementation Links

- Route: `apps/api/src/routes/auth.route.ts`
- Controller: `apps/api/src/controllers/auth.controller.ts`
- Service: `apps/api/src/services/auth-registration.service.ts`
- Repository: `apps/api/src/repositories/auth-config.repository.ts`
- Tests: `apps/api/tests/unit/auth-registration.service.test.ts`, `apps/api/tests/integration/registration-method-options.test.ts`
