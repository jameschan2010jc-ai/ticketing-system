# Frontend Page Spec: PAGE-041 Phone Registration

## Page ID

`PAGE-041`

## Input Artifacts

- UI image: `docs/input/ui-images/p41.jpg`, `docs/input/ui-images/PAGE-041_phone-registration-screen.md`
- Page flow: `docs/input/page-flows/FLOW-041_phone-registration.md`
- Function description: `docs/input/function-descriptions/FUNC-041_phone-registration.md`

## Route

`/register-phone`

## User Goal

Create a new account using phone verification code and password.

## Responsive Priority

- 1st priority: Cell phone
- 2nd priority: Tablet
- Keep form fields full-width and clear.

## UI States

- Default: empty form with send-code and submit actions.
- Loading: send-code or submit in progress.
- Error: validation/send-code/register error displayed.
- Success: registration complete and route to `/auth-success` (p32).

## Interactions

| Action | Trigger | Validation | API Call | Success Result | Error Handling |
| --- | --- | --- | --- | --- | --- |
| Send verification code | Tap send-code button | Valid phone format required | `POST /api/auth/register/phone/send-code` | SMS code sent notification | Show field or system error |
| Complete registration | Tap complete button | Code + password rules + confirm match | `POST /api/auth/register/phone/complete` | Navigate to `/auth-success` (p32) | Stay on page and show error |
| Toggle password visibility | Tap eye icon | None | None | Input visibility toggled | N/A |
| Bottom nav home | Tap Home icon | None | None | Navigate to `/` | N/A |
| Bottom nav profile | Tap Profile icon | None | None | Navigate to `/profile-guest` if logged out, `/profile-center` if logged in | Keep current page if route fails |

## Tracking Links

- Frontend code path: `apps/web/src/pages/register-phone`
- Component path(s): `apps/web/src/components/register-phone-form.tsx`, `apps/web/src/components/bottom-nav.tsx`
- Tests: `apps/web/tests/unit/register-phone-page.test.tsx`, `apps/web/tests/e2e/register-phone.spec.ts`

