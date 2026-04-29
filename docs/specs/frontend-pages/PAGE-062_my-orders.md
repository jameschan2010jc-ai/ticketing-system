# Frontend Page Spec: PAGE-062 My Orders

## Page ID

`PAGE-062`

## Input Artifacts

- UI image: `docs/input/ui-images/p62.jpg`, `docs/input/ui-images/PAGE-062_my-orders-screen.md`
- Page flow: `docs/input/page-flows/FLOW-062_my-orders.md`
- Function description: `docs/input/function-descriptions/FUNC-062_my-orders-list.md`

## Route

`/my-orders`

## User Goal

Review purchase order history and order status.

## Responsive Priority

- 1st priority: Cell phone
- 2nd priority: Tablet

## UI States

- Default: order list shown.
- Empty: no orders.
- Loading: order list loading.
- Error: order list fetch failure.

## Interactions

| Action | Trigger | Validation | API Call | Success Result | Error Handling |
| --- | --- | --- | --- | --- | --- |
| Load orders | Page open | Logged-in session required | `GET /api/orders/my` | Render order list | Show retry state |
| Back | Tap header back arrow | Previous route exists | None | Navigate to `/profile-center` (p61) | Stay on current page |
| Bottom nav home | Tap Home icon | None | None | Navigate to `/` | N/A |
| Bottom nav profile | Tap Profile icon | Logged-in session required | None | Navigate to `/profile-center` | N/A |

## Tracking Links

- Frontend code path: `apps/web/src/pages/my-orders`
- Component path(s): `apps/web/src/components/order-list.tsx`, `apps/web/src/components/bottom-nav.tsx`
- Tests: `apps/web/tests/unit/my-orders-page.test.tsx`, `apps/web/tests/e2e/my-orders.spec.ts`
