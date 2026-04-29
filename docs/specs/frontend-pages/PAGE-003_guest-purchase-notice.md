# Frontend Page Spec: PAGE-003 Guest Purchase Notice

## Page ID

`PAGE-003`

## Input Artifacts

- UI image: `docs/input/ui-images/p3.pdf`, `docs/input/ui-images/PAGE-003_guest-purchase-notice-screen.md`
- Page flow: `docs/input/page-flows/FLOW-003_guest-purchase-notice.md`
- Function description: `docs/input/function-descriptions/FUNC-003_guest-purchase-notice-ack.md`

## Route

`/purchase-method/guest-notice`

## User Goal

Read unregistered purchase notice and acknowledge before continuing.

## Responsive Priority

- 1st priority: Cell phone
- 2nd priority: Tablet
- Keep checkbox and continue button easy to tap on small screens.

## UI States

- Default: notice text visible; continue button disabled.
- Error: failed to load notice content.
- Success: checkbox checked and continue button enabled.

## Interactions

| Action | Trigger | Validation | API Call | Success Result | Error Handling |
| --- | --- | --- | --- | --- | --- |
| Toggle acknowledgement | Tap checkbox | None | None | Continue button enabled/disabled | N/A |
| Continue purchase | Tap continue button | Checkbox must be checked | None | Navigate to `/purchase-content` (p10) | Show route unavailable message |
| Go back | Tap header back arrow | Previous route exists | None | Return to previous page | Stay on current page |
| Bottom nav home | Tap Home icon | None | None | Navigate to `/` | N/A |
| Bottom nav profile | Tap Profile icon | None | None | Navigate to `/profile-guest` if logged out, `/profile-center` if logged in | Keep current page if route fails |

## Tracking Links

- Frontend code path: `apps/web/src/pages/guest-purchase-notice`
- Component path(s): `apps/web/src/components/guest-notice.tsx`, `apps/web/src/components/bottom-nav.tsx`
- Tests: `apps/web/tests/unit/guest-notice-page.test.tsx`, `apps/web/tests/e2e/guest-notice.spec.ts`


