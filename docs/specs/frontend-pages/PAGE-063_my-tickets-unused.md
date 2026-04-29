# Frontend Page Spec: PAGE-063 My Tickets (Unused)

## Page ID

`PAGE-063`

## Input Artifacts

- UI image: `docs/input/ui-images/p63.jpg`, `docs/input/ui-images/PAGE-063_my-tickets-unused-screen.md`
- Page flow: `docs/input/page-flows/FLOW-063_my-tickets-unused.md`
- Function description: `docs/input/function-descriptions/FUNC-063_my-tickets-unused.md`

## Route

`/my-tickets`

## User Goal

View unused tickets and open corresponding QR code for park entry.

## Responsive Priority

- 1st priority: Cell phone
- 2nd priority: Tablet

## UI States

- Default: unused tickets tab active.
- Empty: no unused tickets.
- Loading: ticket list loading.
- Error: ticket list fetch failure.

## Interactions

| Action | Trigger | Validation | API Call | Success Result | Error Handling |
| --- | --- | --- | --- | --- | --- |
| Load unused tickets | Page open or tab switch to unused | Logged-in session required | `GET /api/tickets/my?status=unused` | Render unused ticket list | Show retry state |
| View QR code | Tap `View QR Code` | Ticket must be unused and valid | `GET /api/tickets/{ticketId}/qr` | Show QR code panel/modal | Show QR load error |
| Switch to history tab | Tap history tab | None | None | Show p64 view state | Stay on current tab on error |
| Bottom nav home | Tap Home icon | None | None | Navigate to `/` | N/A |
| Bottom nav profile | Tap Profile icon | Logged-in session required | None | Navigate to `/profile-center` | N/A |

## Tracking Links

- Frontend code path: `apps/web/src/pages/my-tickets`
- Component path(s): `apps/web/src/components/ticket-tabs.tsx`, `apps/web/src/components/ticket-qr-modal.tsx`, `apps/web/src/components/bottom-nav.tsx`
- Tests: `apps/web/tests/unit/my-tickets-page.test.tsx`, `apps/web/tests/e2e/my-tickets.spec.ts`
