# Feature Acceptance Criteria: FEATURE-001 Homepage

## Feature

`FEATURE-001`

## Inputs

- UI image: `docs/input/ui-images/p1.pdf`, `docs/input/ui-images/PAGE-001_home-screen.md`
- Function description: `docs/input/function-descriptions/FUNC-001_homepage-display-and-navigation.md`
- Page flow: `docs/input/page-flows/FLOW-001_homepage-navigation.md`

## Acceptance Criteria

1. Given homepage is opened, when API succeeds, then park name, image, intro, date range, and price info are shown.
2. Given user taps `Start Purchase`, when sales are active, then user is routed to `/purchase-method` (p2).
3. Given user taps bottom Home icon, then user remains on or returns to `/`.
4. Given user taps bottom Profile icon, then system checks auth state and routes to `/profile-guest` (p60) if logged out or `/profile-center` (p61) if logged in.
5. Given homepage API fails, then user sees an error state with retry option.

## Non-Functional Criteria

- Performance: homepage content API responds within 800ms p95 in staging.
- Accessibility: action button and bottom nav icons are keyboard accessible and labeled.
- Security: homepage API returns only public display content.

## Test Coverage Mapping

- Unit: `apps/web/tests/unit/home-page.test.tsx`, `apps/api/tests/unit/home-content.service.test.ts`
- Integration: `apps/api/tests/integration/home-content.test.ts`, `apps/api/tests/integration/auth-session-status.test.ts`
- E2E: `apps/web/tests/e2e/home-navigation.spec.ts`
