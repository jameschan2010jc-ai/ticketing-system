# Frontend Page Spec: PAGE-053 Ticket Verification Failed

## Page ID

`PAGE-053`

## Input Artifacts

- UI image: `docs/input/ui-images/p53.jpg`, `docs/input/ui-images/PAGE-053_ticket-verification-failed-screen.md`
- Page flow: `docs/input/page-flows/FLOW-053_ticket-id-verification-failed.md`
- Function description: `docs/input/function-descriptions/FUNC-053_ticket-id-verification-failed.md`

## Route

`/ticket-verification-failed`

## User Goal

Understand why verification failed and retry upload.

## Responsive Priority

- 1st priority: Cell phone
- 2nd priority: Tablet
- Keep failure reasons readable with clear retry action.

## UI States

- Default: failure icon, reason list, retry button.
- Error: missing verification failure context.

## Interactions

| Action | Trigger | Validation | API Call | Success Result | Error Handling |
| --- | --- | --- | --- | --- | --- |
| Re-upload | Tap re-upload button | None | None | Navigate to `/ticket-verification-upload` (p51) | Show route error and keep current page |
| Bottom nav home | Tap Home icon | None | None | Navigate to `/` | N/A |
| Bottom nav profile | Tap Profile icon | None | None | Navigate to `/profile-guest` if logged out, `/profile-center` if logged in | Keep current page if route fails |

## Tracking Links

- Frontend code path: `apps/web/src/pages/ticket-verification-failed`
- Component path(s): `apps/web/src/components/verification-failed-panel.tsx`, `apps/web/src/components/bottom-nav.tsx`
- Tests: `apps/web/tests/unit/ticket-verification-failed-page.test.tsx`, `apps/web/tests/e2e/ticket-verification-failed.spec.ts`

