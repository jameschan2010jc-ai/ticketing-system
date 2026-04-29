# Feature Acceptance Criteria: FEATURE-063 My Tickets Unused

## Feature

`FEATURE-063`

## Inputs

- UI image: `docs/input/ui-images/p63.jpg`, `docs/input/ui-images/PAGE-063_my-tickets-unused-screen.md`
- Function description: `docs/input/function-descriptions/FUNC-063_my-tickets-unused.md`
- Page flow: `docs/input/page-flows/FLOW-063_my-tickets-unused.md`

## Acceptance Criteria

1. Given logged-in user opens My tickets, then unused tab is shown by default.
2. Given unused tickets exist, then list displays ticket date/count/status.
3. Given user taps `View QR Code` on unused ticket, then corresponding QR code is shown.
4. Given user switches to history tab, then history list view (p64) is displayed.

## Non-Functional Criteria

- Performance: ticket list and QR API each respond within 1s p95.
- Accessibility: tabs and QR actions are keyboard-focusable and labeled.
- Security: QR code access requires authenticated ownership of ticket.

## Test Coverage Mapping

- Unit: `apps/web/tests/unit/my-tickets-page.test.tsx`, `apps/api/tests/unit/tickets.service.test.ts`
- Integration: `apps/api/tests/integration/tickets-my-unused.test.ts`, `apps/api/tests/integration/tickets-qr.test.ts`
- E2E: `apps/web/tests/e2e/my-tickets.spec.ts`
