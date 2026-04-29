# Frontend Page Spec: PAGE-051 Ticket Verification Upload

## Page ID

`PAGE-051`

## Input Artifacts

- UI image: `docs/input/ui-images/p51.jpg`, `docs/input/ui-images/PAGE-051_ticket-verification-upload-screen.md`
- Page flow: `docs/input/page-flows/FLOW-051_ticket-id-verification-upload.md`
- Function description: `docs/input/function-descriptions/FUNC-051_ticket-id-verification-upload.md`

## Route

`/ticket-verification-upload`

## User Goal

Upload a valid ID document image for ticket eligibility verification.

## Responsive Priority

- 1st priority: Cell phone
- 2nd priority: Tablet
- Keep upload area and notices readable on small screens.

## UI States

- Default: upload CTA and verification notes visible.
- Uploading: file upload in progress.
- Processing: verification in progress.
- Error: upload/verification error.
- Success: route to p52 or p53 depending on result.

## Interactions

| Action | Trigger | Validation | API Call | Success Result | Error Handling |
| --- | --- | --- | --- | --- | --- |
| Upload ID image | Tap upload area/button | File type/size/image quality checks | `POST /api/ticket-verification/upload-id` | Verification started | Show upload error |
| Submit for verification | Auto or tap after upload | File must be uploaded | `POST /api/ticket-verification/verify` | Route to p52 if valid; p53 if invalid | Show processing error and allow retry |
| Bottom nav home | Tap Home icon | None | None | Navigate to `/` | N/A |
| Bottom nav profile | Tap Profile icon | None | None | Navigate to `/profile-guest` if logged out, `/profile-center` if logged in | Keep current page if route fails |

## Tracking Links

- Frontend code path: `apps/web/src/pages/ticket-verification-upload`
- Component path(s): `apps/web/src/components/id-upload-panel.tsx`, `apps/web/src/components/verification-notes.tsx`, `apps/web/src/components/bottom-nav.tsx`
- Tests: `apps/web/tests/unit/ticket-verification-upload-page.test.tsx`, `apps/web/tests/e2e/ticket-verification-upload.spec.ts`

