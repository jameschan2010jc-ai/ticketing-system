# Frontend Page Spec: PAGE-050 Verification Required Order

## Page ID

`PAGE-050`

## Input Artifacts

- UI image: `docs/input/ui-images/p50.jpg`, `docs/input/ui-images/PAGE-050_verification-required-order-screen.md`
- Page flow: `docs/input/page-flows/FLOW-050_verification-required-order-review.md`
- Function description: `docs/input/function-descriptions/FUNC-050_verification-required-order-review.md`

## Route

`/verification-required-order`

## User Goal

Review order and start required ID verification before payment.

## Responsive Priority

- 1st priority: Cell phone
- 2nd priority: Tablet
- Keep key order information and CTA visible without horizontal scrolling.

## UI States

- Default: order summary and verification reminder visible.
- Error: missing order context.
- Success: start verification routes to `/ticket-verification-upload` (p51).

## Interactions

| Action | Trigger | Validation | API Call | Success Result | Error Handling |
| --- | --- | --- | --- | --- | --- |
| Start verification | Tap start verification button | Verification-required context present | None | Navigate to `/ticket-verification-upload` (p51) | Show context error and keep page |
| Back/edit | Tap edit/back action | Previous step exists | None | Return to `/purchase-content` (p10) | Keep current page |
| Bottom nav home | Tap Home icon | None | None | Navigate to `/` | N/A |
| Bottom nav profile | Tap Profile icon | None | None | Navigate to `/profile-guest` if logged out, `/profile-center` if logged in | Keep current page if route fails |

## Tracking Links

- Frontend code path: `apps/web/src/pages/verification-required-order`
- Component path(s): `apps/web/src/components/order-summary-card.tsx`, `apps/web/src/components/verification-reminder.tsx`, `apps/web/src/components/bottom-nav.tsx`
- Tests: `apps/web/tests/unit/verification-required-order-page.test.tsx`, `apps/web/tests/e2e/verification-required-order.spec.ts`

