# Frontend Page Spec: PAGE-001 Home

## Page ID

`PAGE-001`

## Input Artifacts

- UI image: `docs/input/ui-images/p1.pdf`, `docs/input/ui-images/PAGE-001_home-screen.md`
- Page flow: `docs/input/page-flows/FLOW-001_homepage-navigation.md`
- Function description: `docs/input/function-descriptions/FUNC-001_homepage-display-and-navigation.md`

## Route

`/`

## User Goal

View park highlights and start ticket purchase quickly.

## Responsive Priority

- 1st priority: Cell phone
- 2nd priority: Tablet
- Use phone-first layout and controls with touch-friendly spacing.

## UI States

- Default: park hero information displayed.
- Loading: skeleton/loading placeholder for park content.
- Error: show retry banner when homepage data fetch fails.
- Success: clicking `Start Purchase` moves to `/purchase-method`.

## Interactions

| Action | Trigger | Validation | API Call | Success Result | Error Handling |
| --- | --- | --- | --- | --- | --- |
| Load homepage content | Page open | None | `GET /api/home-content` | Park info rendered | Show error banner and retry |
| Start purchase | Click `Start Purchase` | Ticket sales must be active | None (or precheck API optional) | Navigate to `/purchase-method` | Show unavailable message |
| Open profile | Click bottom-right profile icon | Auth status is checked | `GET /api/auth/session-status` | Navigate to `/profile-guest` (p60) if logged out, `/profile-center` (p61) if logged in | Keep current page if route fails |
| Return home | Click bottom-left home icon | None | None | Stay on `/` | N/A |

## Tracking Links

- Frontend code path: `apps/web/src/pages/home`
- Component path(s): `apps/web/src/components/home-hero.tsx`, `apps/web/src/components/bottom-nav.tsx`
- Tests: `apps/web/tests/unit/home-page.test.tsx`, `apps/web/tests/e2e/home-navigation.spec.ts`
