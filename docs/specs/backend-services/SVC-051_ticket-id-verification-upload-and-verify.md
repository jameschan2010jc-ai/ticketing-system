# Backend Service Spec: SVC-051 Ticket ID Verification Upload and Verify

## Service ID

`SVC-051`

## Related Requirements

- `REQ-015`

## Endpoints

- Method: `POST`
- Path: `/api/ticket-verification/upload-id`

- Method: `POST`
- Path: `/api/ticket-verification/verify`

## Request/Response Contract

- Request type:
- `packages/shared-types/src/ticket-verification.ts#UploadIdRequest`
- `packages/shared-types/src/ticket-verification.ts#VerifyTicketEligibilityRequest`
- Response type:
- `packages/shared-types/src/ticket-verification.ts#UploadIdResponse`
- `packages/shared-types/src/ticket-verification.ts#VerifyTicketEligibilityResponse`

## Business Rules

1. Accept only supported image types and size limits.
2. Validate image quality/readability before verification.
3. Check ID eligibility rules by ticket type (age/identity constraints).
4. Return verification result status and reason list.
5. Preserve auditable verification record.

## Error Cases

| Scenario | Status Code | Response |
| --- | --- | --- |
| Invalid file type/size | 400 | `{ code: "INVALID_ID_IMAGE", message: string }` |
| Image unreadable | 422 | `{ code: "ID_IMAGE_UNREADABLE", message: string }` |
| Verification provider timeout | 504 | `{ code: "VERIFICATION_TIMEOUT", message: string }` |
| Verification provider unavailable | 503 | `{ code: "VERIFICATION_SERVICE_UNAVAILABLE", message: string }` |
| Unexpected error | 500 | `{ code: "INTERNAL_ERROR", message: string }` |

## Implementation Links

- Route: `apps/api/src/routes/ticket-verification.route.ts`
- Controller: `apps/api/src/controllers/ticket-verification.controller.ts`
- Service: `apps/api/src/services/ticket-verification.service.ts`
- Repository: `apps/api/src/repositories/ticket-verification.repository.ts`
- Tests: `apps/api/tests/unit/ticket-verification.service.test.ts`, `apps/api/tests/integration/ticket-verification-upload-and-verify.test.ts`
