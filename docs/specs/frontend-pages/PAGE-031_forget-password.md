# Frontend Page Spec: PAGE-031 Forget Password

## Page ID

`PAGE-031`

## Input Artifacts

- UI image: `docs/input/ui-images/p31.jpg`, `docs/input/ui-images/PAGE-031_forget-password-screen.md`
- Page flow: `docs/input/page-flows/FLOW-031_forget-password-reset.md`
- Function description: `docs/input/function-descriptions/FUNC-031_forget-password-reset.md`

## Route

`/forget-password`

## User Goal

Reset account password and return to login.

## Responsive Priority

- 1st priority: Cell phone
- 2nd priority: Tablet
- Keep verification and password fields clear and touch-friendly.

## UI States

- Default: account, verification, and password fields visible.
- Loading: send-code or reset request in progress.
- Error: validation or backend error shown.
- Success: route back to `/login-existing-account` (p30).

## Interactions

| Action | Trigger | Validation | API Call | Success Result | Error Handling |
| --- | --- | --- | --- | --- | --- |
| Send verification code | Tap send-code button | Account required | `POST /api/auth/forgot-password/send-code` | Code sent state shown | Show send failure message |
| Complete reset | Tap complete button | Account/code/passwords required; passwords must match | `POST /api/auth/forgot-password/reset` | Navigate to `/login-existing-account` (p30) | Show validation/backend error |
| Go back | Tap header back arrow | Previous route exists | None | Return to p30 | Stay on current page |
| Bottom nav home | Tap Home icon | None | None | Navigate to `/` | N/A |
| Bottom nav profile | Tap Profile icon | None | None | Navigate to `/profile-guest` if logged out, `/profile-center` if logged in | Keep current page if route fails |

## Tracking Links

- Frontend code path: `apps/web/src/pages/forget-password`
- Component path(s): `apps/web/src/components/forget-password-form.tsx`, `apps/web/src/components/bottom-nav.tsx`
- Tests: `apps/web/tests/unit/forget-password-page.test.tsx`, `apps/web/tests/e2e/forget-password.spec.ts`

