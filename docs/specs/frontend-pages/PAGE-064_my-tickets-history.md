# Frontend Page Spec: PAGE-064 My Tickets (History)

## Page ID

`PAGE-064`

## Input Artifacts

- UI image: `docs/input/ui-images/p64.jpg`, `docs/input/ui-images/PAGE-064_my-tickets-history-screen.md`
- Page flow: `docs/input/page-flows/FLOW-064_my-tickets-history.md`
- Function description: `docs/input/function-descriptions/FUNC-064_my-tickets-history.md`

## Route

`/my-tickets` (history tab state)

## User Goal

Review previously used tickets.

## Responsive Priority

- 1st priority: Cell phone
- 2nd priority: Tablet

## UI States

- Default: history tab active with used ticket list.
- Empty: no history tickets.
- Loading: history list loading.
- Error: history list fetch failure.

## Interactions

| Action | Trigger | Validation | API Call | Success Result | Error Handling |
| --- | --- | --- | --- | --- | --- |
| Load history tickets | Switch to history tab | Logged-in session required | `GET /api/tickets/my?status=used` | Render used ticket history | Show retry state |
| Switch to unused tab | Tap unused tab | None | None | Show p63 view state | Stay on current tab on error |
| Bottom nav home | Tap Home icon | None | None | Navigate to `/` | N/A |
| Bottom nav profile | Tap Profile icon | Logged-in session required | None | Navigate to `/profile-center` | N/A |

## Tracking Links

- Frontend code path: `apps/web/src/pages/my-tickets`
- Component path(s): `apps/web/src/components/ticket-tabs.tsx`, `apps/web/src/components/bottom-nav.tsx`
- Tests: `apps/web/tests/unit/my-tickets-page.test.tsx`, `apps/web/tests/e2e/my-tickets-history.spec.ts`
