# Frontend Page Spec: PAGE-030 Existing Account Login

## Page ID

`PAGE-030`

## Input Artifacts

- UI image: `docs/input/ui-images/p30.jpg`, `docs/input/ui-images/PAGE-030_existing-login-screen.md`
- Page flow: `docs/input/page-flows/FLOW-030_existing-account-login.md`
- Function description: `docs/input/function-descriptions/FUNC-030_existing-account-login.md`

## Route

`/login-existing-account`

## User Goal

Login with existing account and continue purchase flow.

## Responsive Priority

- 1st priority: Cell phone
- 2nd priority: Tablet
- Keep input fields and login CTA easy to use on mobile.

## UI States

- Default: account/password fields and login button visible.
- Loading: login request in progress.
- Error: login failure message shown in lower area.
- Success: route to `/auth-success` (p32).

## Interactions

| Action | Trigger | Validation | API Call | Success Result | Error Handling |
| --- | --- | --- | --- | --- | --- |
| Submit login | Tap login button | Account/password required | `POST /api/auth/login` | Navigate to `/auth-success` (p32) | Show login error in lower area |
| Forget password | Tap `敹?撖Ⅳ嚗 | None | None | Navigate to `/forget-password` (p31) | Stay on page if route fails |
| Go back | Tap header back arrow | Previous route exists | None | Return to `/purchase-method` | Stay on current page |
| Bottom nav home | Tap Home icon | None | None | Navigate to `/` | N/A |
| Bottom nav profile | Tap Profile icon | None | None | Navigate to `/profile-guest` if logged out, `/profile-center` if logged in | Keep current page if route fails |

## Tracking Links

- Frontend code path: `apps/web/src/pages/login-existing-account`
- Component path(s): `apps/web/src/components/login-form.tsx`, `apps/web/src/components/bottom-nav.tsx`
- Tests: `apps/web/tests/unit/login-existing-account-page.test.tsx`, `apps/web/tests/e2e/login-existing-account.spec.ts`

