# Frontend Page Spec: PAGE-011 Order Confirmation

## Page ID

`PAGE-011`

## Input Artifacts

- UI image: `docs/input/ui-images/p11.jpg`, `docs/input/ui-images/PAGE-011_order-confirmation-screen.md`
- Page flow: `docs/input/page-flows/FLOW-011_order-confirmation-and-pay.md`
- Function description: `docs/input/function-descriptions/FUNC-011_order-confirmation-and-pay.md`

## Route

`/order-confirmation`

## User Goal

Review full order details and proceed to payment.

## Responsive Priority

- 1st priority: Cell phone
- 2nd priority: Tablet
- Keep summary cards readable and payment CTA prominent.

## UI States

- Default: order summary sections and total amount are displayed.
- Loading: order summary is loading.
- Error: order summary unavailable or expired.
- Success: confirm-and-pay action routes to `/payment-method` (p12).

## Interactions

| Action | Trigger | Validation | API Call | Success Result | Error Handling |
| --- | --- | --- | --- | --- | --- |
| Load summary | Page open | Valid draft order/session required | `GET /api/order-confirmation/summary` | Render order details and total | Show expired/reload message |
| Go back | Tap header back arrow | Previous route exists | None | Return to `/purchase-content` | Stay on current page |
| Confirm and pay | Tap confirm and pay button | Summary exists and amount matches server | `POST /api/order-confirmation/confirm-and-pay` | Create payment session and route to `/payment-method` (p12) | Show error and keep on p11 |
| Bottom nav home | Tap Home icon | None | None | Navigate to `/` | N/A |
| Bottom nav profile | Tap Profile icon | None | None | Navigate to `/profile-guest` if logged out, `/profile-center` if logged in | Keep current page if route fails |

## Tracking Links

- Frontend code path: `apps/web/src/pages/order-confirmation`
- Component path(s): `apps/web/src/components/order-summary.tsx`, `apps/web/src/components/notice-list.tsx`, `apps/web/src/components/price-summary.tsx`
- Tests: `apps/web/tests/unit/order-confirmation-page.test.tsx`, `apps/web/tests/e2e/order-confirmation.spec.ts`

