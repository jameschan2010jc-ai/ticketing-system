# Frontend Page Spec: PAGE-002 Purchase Method

## Page ID

`PAGE-002`

## Input Artifacts

- UI image: `docs/input/ui-images/p2.jpg`, `docs/input/ui-images/PAGE-002_purchase-method-screen.md`
- Page flow: `docs/input/page-flows/FLOW-002_purchase-method-selection.md`
- Function description: `docs/input/function-descriptions/FUNC-002_purchase-method-selection.md`

## Route

`/purchase-method`

## User Goal

Choose purchase entry method before continuing to the next step.

## Responsive Priority

- 1st priority: Cell phone
- 2nd priority: Tablet
- Keep actions large and single-column on phone.

## UI States

- Default: three purchase options are displayed.
- Loading: optional loading placeholder during page init.
- Error: unavailable route or temporary action error.
- Success: selecting an option routes correctly.

## Interactions

| Action | Trigger | Validation | API Call | Success Result | Error Handling |
| --- | --- | --- | --- | --- | --- |
| Go back | Tap header back arrow | Previous route exists | None | Return to previous page | Stay on current page |
| Existing account login | Tap option 1 | Route exists | None | Navigate to `/login-existing-account` (p30) | Show temporary error message |
| Register new account | Tap option 2 | Route exists | None | Navigate to `/register-method` (p40) | Show temporary error message |
| Direct purchase | Tap option 3 | None | None | Navigate to `/purchase-method/guest-notice` (p3) | Show temporary error message |
| Bottom nav home | Tap Home icon | None | None | Navigate to `/` | N/A |
| Bottom nav profile | Tap Profile icon | None | None | Navigate to `/profile-guest` if logged out, `/profile-center` if logged in | Keep current page if route fails |

## Tracking Links

- Frontend code path: `apps/web/src/pages/purchase-method`
- Component path(s): `apps/web/src/components/purchase-method-options.tsx`, `apps/web/src/components/bottom-nav.tsx`
- Tests: `apps/web/tests/unit/purchase-method-page.test.tsx`, `apps/web/tests/e2e/purchase-method.spec.ts`

