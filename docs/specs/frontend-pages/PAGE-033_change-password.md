# Frontend Page Spec: PAGE-033 Change Password

## Page ID

`PAGE-033`

## Input Artifacts

- UI image: `docs/input/ui-images/p33.jpg`, `docs/input/ui-images/PAGE-033_change-password-screen.md`
- Page flow: `docs/input/page-flows/FLOW-033_change-password-from-profile.md`
- Function description: `docs/input/function-descriptions/FUNC-033_change-password-from-profile.md`

## Route

`/change-password`

## User Goal

Change account password from profile center.

## Responsive Priority

- 1st priority: Cell phone
- 2nd priority: Tablet

## UI States

- Default: account, verification, and password fields shown.
- Loading: send-code or submit in progress.
- Error: field or API validation errors.
- Success: password updated and return to p61.

## Interactions

| Action | Trigger | Validation | API Call | Success Result | Error Handling |
| --- | --- | --- | --- | --- | --- |
| Send verification code | Tap send-code button | Account required | `POST /api/auth/change-password/send-code` | Code sent state shown | Show send failure |
| Submit new password | Tap complete button | Code valid; password rule; confirm match | `POST /api/auth/change-password/complete` | Navigate to `/profile-center` (p61) | Show validation error |
| Toggle password visibility | Tap eye icon | None | None | Toggle input visibility | N/A |
| Bottom nav home | Tap Home icon | None | None | Navigate to `/` | N/A |
| Bottom nav profile | Tap Profile icon | Session-dependent | None | Navigate to `/profile-center` if logged in, else `/profile-guest` | N/A |

## Tracking Links

- Frontend code path: `apps/web/src/pages/change-password`
- Component path(s): `apps/web/src/components/change-password-form.tsx`, `apps/web/src/components/bottom-nav.tsx`
- Tests: `apps/web/tests/unit/change-password-page.test.tsx`, `apps/web/tests/e2e/change-password.spec.ts`
