# Backend Service Spec Template

## Service ID

`SVC-XXX`

## Related Requirements

- `REQ-...`

## Endpoint

- Method: `POST`
- Path: `/api/example`

## Request/Response Contract

- Request type: `packages/shared-types/src/...`
- Response type: `packages/shared-types/src/...`

## Business Rules

1. Rule one.
2. Rule two.

## Error Cases

| Scenario | Status Code | Response |
| --- | --- | --- |
| Validation fail | 400 | Error payload |
| Unauthorized | 401 | Error payload |

## Implementation Links

- Route: `apps/api/src/routes/...`
- Controller: `apps/api/src/controllers/...`
- Service: `apps/api/src/services/...`
- Repository: `apps/api/src/repositories/...`
- Tests: `apps/api/tests/...`
