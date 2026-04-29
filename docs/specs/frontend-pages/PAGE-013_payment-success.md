# Frontend Page Spec: PAGE-013 Payment Success

## Page ID

`PAGE-013`

## Input Artifacts

- UI image: `docs/input/ui-images/p13.jpg`, `docs/input/ui-images/PAGE-013_payment-success-screen.md`
- Page flow: `docs/input/page-flows/FLOW-013_payment-success-voucher.md`
- Function description: `docs/input/function-descriptions/FUNC-013_payment-success-voucher.md`

## Route

`/payment-success`

## User Goal

Review payment success and keep voucher for entry.

## Responsive Priority

- 1st priority: Cell phone
- 2nd priority: Tablet
- Keep QR code and save action prominent.

## UI States

- Default: payment success details and QR voucher displayed.
- Loading: success data is loading.
- Error: payment result unavailable.
- Success: save-to-device action completed.

## Interactions

| Action | Trigger | Validation | API Call | Success Result | Error Handling |
| --- | --- | --- | --- | --- | --- |
| Load result | Page open | Valid order/payment reference | `GET /api/payment/success-summary` | Render success summary and QR voucher | Show reload/error message |
| Save voucher | Tap save-to-phone button | Voucher data must exist | None (client-side save/share) | Voucher saved to device | Show save failure message |
| Go back | Tap header back arrow | Previous route exists | None | Return to previous page | Stay on current page |
| Bottom nav home | Tap Home icon | None | None | Navigate to `/` | N/A |
| Bottom nav profile | Tap Profile icon | None | None | Navigate to `/profile-guest` if logged out, `/profile-center` if logged in | Keep current page if route fails |

## Tracking Links

- Frontend code path: `apps/web/src/pages/payment-success`
- Component path(s): `apps/web/src/components/payment-success-summary.tsx`, `apps/web/src/components/qr-voucher.tsx`
- Tests: `apps/web/tests/unit/payment-success-page.test.tsx`, `apps/web/tests/e2e/payment-success.spec.ts`

