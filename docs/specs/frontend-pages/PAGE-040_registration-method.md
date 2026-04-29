# Frontend Page Spec: PAGE-040 Registration Method

## Page ID

`PAGE-040`

## Input Artifacts

- UI image: `docs/input/ui-images/p40.jpg`, `docs/input/ui-images/PAGE-040_registration-method-screen.md`
- Page flow: `docs/input/page-flows/FLOW-040_registration-method-selection.md`
- Function description: `docs/input/function-descriptions/FUNC-040_registration-method-selection.md`

## Route

`/register-method`

## User Goal

Choose a registration method (phone or email) before creating an account.

## Responsive Priority

- 1st priority: Cell phone
- 2nd priority: Tablet
- Keep two option cards easy to tap.

## UI States

- Default: two registration options are visible.
- Error: route transition fails.

## Interactions

| Action | Trigger | Validation | API Call | Success Result | Error Handling |
| --- | --- | --- | --- | --- | --- |
| Go back | Tap header back arrow | Previous route exists | None | Navigate to `/purchase-method` (p2) | Stay on current page |
| Phone registration | Tap option 1 | Route exists | None | Navigate to `/register-phone` (p41) | Show temporary error message |
| Email registration | Tap option 2 | Route exists | None | Navigate to `/register-email` (p42) | Show temporary error message |
| Bottom nav home | Tap Home icon | None | None | Navigate to `/` | N/A |
| Bottom nav profile | Tap Profile icon | None | None | Navigate to `/profile-guest` if logged out, `/profile-center` if logged in | Keep current page if route fails |

## Tracking Links

- Frontend code path: `apps/web/src/pages/register-method`
- Component path(s): `apps/web/src/components/register-method-options.tsx`, `apps/web/src/components/bottom-nav.tsx`
- Tests: `apps/web/tests/unit/register-method-page.test.tsx`, `apps/web/tests/e2e/register-method.spec.ts`

