# Frontend Page Spec: PAGE-012 Payment Method

## Page ID

`PAGE-012`

## Input Artifacts

- UI image: `docs/input/ui-images/p12.jpg`, `docs/input/ui-images/PAGE-012_payment-method-screen.md`
- Page flow: `docs/input/page-flows/FLOW-012_payment-method-selection.md`
- Function description: `docs/input/function-descriptions/FUNC-012_payment-method-selection.md`

## Route

`/payment-method`

## User Goal

Choose payment method and continue to payment result step.

## Responsive Priority

- 1st priority: Cell phone
- 2nd priority: Tablet
- Keep method cards easy to tap.

## UI States

- Default: payment method options are displayed.
- Loading: methods are loading.
- Error: methods unavailable.
- Success: method selected and route to p13.

## Interactions

| Action | Trigger | Validation | API Call | Success Result | Error Handling |
| --- | --- | --- | --- | --- | --- |
| Load methods | Page open | None | `GET /api/payment/methods` | Render method options | Show retry state |
| Select method | Tap method card | One option must be selected | `POST /api/payment/select-method` | Route to `/payment-success` (p13) | Show selection failure |
| Go back | Tap header back arrow | Previous route exists | None | Return to previous page (p11 or p52 source) | Stay on current page |
| Bottom nav home | Tap Home icon | None | None | Navigate to `/` | N/A |
| Bottom nav profile | Tap Profile icon | None | None | Navigate to `/profile-guest` if logged out, `/profile-center` if logged in | Keep current page if route fails |

## Tracking Links

- Frontend code path: `apps/web/src/pages/payment-method`
- Component path(s): `apps/web/src/components/payment-method-list.tsx`
- Tests: `apps/web/tests/unit/payment-method-page.test.tsx`, `apps/web/tests/e2e/payment-method.spec.ts`

