# Frontend Page Spec: PAGE-061 Profile Center (Logged-in)

## Page ID

`PAGE-061`

## Input Artifacts

- UI image: `docs/input/ui-images/p61.jpg`, `docs/input/ui-images/PAGE-061_profile-center-logged-in-screen.md`
- Page flow: `docs/input/page-flows/FLOW-061_profile-center-logged-in.md`
- Function description: `docs/input/function-descriptions/FUNC-061_profile-center-menu-logged-in.md`

## Route

`/profile-center`

## User Goal

Manage account-related actions after login.

## Responsive Priority

- 1st priority: Cell phone
- 2nd priority: Tablet

## UI States

- Default: user info and four action menu items shown.
- Loading: profile summary is loading.
- Error: profile data fetch failure.

## Interactions

| Action | Trigger | Validation | API Call | Success Result | Error Handling |
| --- | --- | --- | --- | --- | --- |
| Open my orders | Tap `My orders` | Logged-in session required | None | Navigate to `/my-orders` (p62) | Show route error |
| Open my tickets | Tap `My tickets` | Logged-in session required | None | Navigate to `/my-tickets` (p63) | Show route error |
| Change password | Tap `Change password` | Logged-in session required | None | Navigate to `/change-password` (p33) | Show route error |
| Logout | Tap `Logout` | Logged-in session required | `POST /api/auth/logout` | Clear session and navigate to `/` (p1) | Show logout failure |
| Bottom nav home | Tap Home icon | None | None | Navigate to `/` | N/A |
| Bottom nav profile | Tap Profile icon | Logged-in session required | None | Stay on `/profile-center` | N/A |

## Tracking Links

- Frontend code path: `apps/web/src/pages/profile-center`
- Component path(s): `apps/web/src/components/profile-menu.tsx`, `apps/web/src/components/bottom-nav.tsx`
- Tests: `apps/web/tests/unit/profile-center-page.test.tsx`, `apps/web/tests/e2e/profile-center.spec.ts`
