# Frontend Page Spec: PAGE-010 Purchase Content

## Page ID

`PAGE-010`

## Input Artifacts

- UI image: `docs/input/ui-images/p10.pdf`, `docs/input/ui-images/PAGE-010_purchase-content-screen.md`
- Page flow: `docs/input/page-flows/FLOW-010_purchase-content-selection.md`
- Function description: `docs/input/function-descriptions/FUNC-010_purchase-content-selection.md`

## Route

`/purchase-content`

## User Goal

Select date, time, and one ticket type to continue purchase.

## Responsive Priority

- 1st priority: Cell phone
- 2nd priority: Tablet
- Keep selectors and confirm button easy to operate on phone screens.

## UI States

- Default: selectors visible; confirm button disabled before valid selections.
- Loading: options (date/time/ticket type) are loading.
- Empty: no available purchase options.
- Error: API or validation error shown.
- Success: confirm action proceeds to p50 or p11 based on backend verification flag.

## Interactions

| Action | Trigger | Validation | API Call | Success Result | Error Handling |
| --- | --- | --- | --- | --- | --- |
| Load options | Page open | None | `GET /api/purchase-content/options` | Render available dates/times/ticket types | Show retry state |
| Select date | Tap date picker | Date must be available | Optional refresh API | Update available times | Show unavailable message |
| Select time | Tap time selector | Time slot must be available | Optional refresh API | Time selected | Show unavailable message |
| Select ticket type | Tap ticket type selector | Single-select, max 1 ticket rule | None | Ticket type selected | Show validation text |
| Confirm purchase | Tap confirm purchase button | Date/time/ticket type required | `POST /api/purchase-content/confirm` | If verification required route to `/verification-required-order` (p50); otherwise route to `/order-confirmation` (p11) | Show backend validation error |
| Bottom nav home | Tap Home icon | None | None | Navigate to `/` | N/A |
| Bottom nav profile | Tap Profile icon | None | None | Navigate to `/profile-guest` if logged out, `/profile-center` if logged in | Keep current page if route fails |

## Tracking Links

- Frontend code path: `apps/web/src/pages/purchase-content`
- Component path(s): `apps/web/src/components/date-selector.tsx`, `apps/web/src/components/time-selector.tsx`, `apps/web/src/components/ticket-type-selector.tsx`
- Tests: `apps/web/tests/unit/purchase-content-page.test.tsx`, `apps/web/tests/e2e/purchase-content.spec.ts`

