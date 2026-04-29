# Frontend Page Spec: PAGE-032 Auth Success

## Page ID

`PAGE-032`

## Input Artifacts

- UI image: `docs/input/ui-images/p32.jpg`, `docs/input/ui-images/PAGE-032_auth-success-screen.md`
- Page flow: `docs/input/page-flows/FLOW-032_auth-success-continue.md`
- Function description: `docs/input/function-descriptions/FUNC-032_auth-success-continue.md`

## Route

`/auth-success`

## User Goal

Confirm successful authentication and continue to ticket purchase flow.

## Responsive Priority

- 1st priority: Cell phone
- 2nd priority: Tablet
- Keep success message and continue CTA prominent.

## UI States

- Default: success message and continue button visible.
- Error: success context missing.
- Success: continue action routes to `/purchase-content` (p10).

## Interactions

| Action | Trigger | Validation | API Call | Success Result | Error Handling |
| --- | --- | --- | --- | --- | --- |
| Continue purchase | Tap continue button | Auth success context required | None | Navigate to `/purchase-content` (p10) | Show context-missing message |
| Go back | Tap header back arrow | Previous route exists | None | Return to source auth page | Stay on current page |
| Bottom nav home | Tap Home icon | None | None | Navigate to `/` | N/A |
| Bottom nav profile | Tap Profile icon | None | None | Navigate to `/profile-guest` if logged out, `/profile-center` if logged in | Keep current page if route fails |

## Tracking Links

- Frontend code path: `apps/web/src/pages/auth-success`
- Component path(s): `apps/web/src/components/auth-success-panel.tsx`, `apps/web/src/components/bottom-nav.tsx`
- Tests: `apps/web/tests/unit/auth-success-page.test.tsx`, `apps/web/tests/e2e/auth-success.spec.ts`

