# Frontend Page Spec: PAGE-060 Profile Center (Logged-out)

## Page ID

`PAGE-060`

## Input Artifacts

- UI image: `docs/input/ui-images/p60.jpg`, `docs/input/ui-images/PAGE-060_profile-center-logged-out-screen.md`
- Page flow: `docs/input/page-flows/FLOW-060_profile-entry-logged-out.md`
- Function description: `docs/input/function-descriptions/FUNC-060_profile-center-entry-logged-out.md`

## Route

`/profile-guest`

## User Goal

Access account entry actions when not logged in.

## Responsive Priority

- 1st priority: Cell phone
- 2nd priority: Tablet

## UI States

- Default: logged-out profile panel with login/register actions.
- Error: auth state missing or route failure.

## Interactions

| Action | Trigger | Validation | API Call | Success Result | Error Handling |
| --- | --- | --- | --- | --- | --- |
| Login | Tap login button/menu item | None | None | Navigate to `/login-existing-account` (p30) | Show route error |
| Register | Tap register button/menu item | None | None | Navigate to `/register-method` (p40) | Show route error |
| Back | Tap header back arrow | Previous route exists | None | Return to previous page | Stay on current page |
| Bottom nav home | Tap Home icon | None | None | Navigate to `/` | N/A |
| Bottom nav profile | Tap Profile icon | Not logged in | None | Stay on `/profile-guest` | N/A |

## Tracking Links

- Frontend code path: `apps/web/src/pages/profile-guest`
- Component path(s): `apps/web/src/components/profile-guest-panel.tsx`, `apps/web/src/components/bottom-nav.tsx`
- Tests: `apps/web/tests/unit/profile-guest-page.test.tsx`, `apps/web/tests/e2e/profile-guest.spec.ts`
