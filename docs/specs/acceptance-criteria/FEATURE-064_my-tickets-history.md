# Feature Acceptance Criteria: FEATURE-064 My Tickets History

## Feature

`FEATURE-064`

## Inputs

- UI image: `docs/input/ui-images/p64.jpg`, `docs/input/ui-images/PAGE-064_my-tickets-history-screen.md`
- Function description: `docs/input/function-descriptions/FUNC-064_my-tickets-history.md`
- Page flow: `docs/input/page-flows/FLOW-064_my-tickets-history.md`

## Acceptance Criteria

1. Given user switches to history tab in My tickets, then used ticket history list is shown.
2. Given no history tickets, then empty state is shown.
3. Given user switches back to unused tab, then p63 view is restored.

## Non-Functional Criteria

- Performance: history tab data load completes within 1s p95.
- Accessibility: tab controls and list items are keyboard accessible.
- Security: history tickets are restricted to authenticated user data.

## Test Coverage Mapping

- Unit: `apps/web/tests/unit/my-tickets-page.test.tsx`, `apps/api/tests/unit/tickets.service.test.ts`
- Integration: `apps/api/tests/integration/tickets-my-history.test.ts`
- E2E: `apps/web/tests/e2e/my-tickets-history.spec.ts`
