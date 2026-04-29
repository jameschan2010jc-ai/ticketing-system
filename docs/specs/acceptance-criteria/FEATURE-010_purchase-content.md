# Feature Acceptance Criteria: FEATURE-010 Purchase Content

## Feature

`FEATURE-010`

## Inputs

- UI image: `docs/input/ui-images/p10.pdf`, `docs/input/ui-images/PAGE-010_purchase-content-screen.md`
- Function description: `docs/input/function-descriptions/FUNC-010_purchase-content-selection.md`
- Page flow: `docs/input/page-flows/FLOW-010_purchase-content-selection.md`

## Acceptance Criteria

1. Given p10 page is opened, then date/time/ticket type selectors are visible.
2. Given required fields are not complete, then confirm purchase button remains disabled.
3. Given user selects valid date, time, and ticket type, then confirm purchase button is enabled.
4. Given user taps confirm purchase and backend returns `requiresIdVerification = true`, then system routes to `/verification-required-order` (p50).
5. Given user taps confirm purchase and backend returns `requiresIdVerification = false`, then system routes to `/order-confirmation` (p11).
6. Given backend reports option unavailable, then user sees clear validation feedback and stays on p10.

## Non-Functional Criteria

- Performance: options API responds within 1s p95.
- Accessibility: date/time/ticket selectors and confirm button are keyboard accessible.
- Security: backend validates selections server-side before proceeding.

## Test Coverage Mapping

- Unit: `apps/web/tests/unit/purchase-content-page.test.tsx`, `apps/api/tests/unit/purchase-content.service.test.ts`
- Integration: `apps/api/tests/integration/purchase-content-options.test.ts`, `apps/api/tests/integration/purchase-content-confirm.test.ts`
- E2E: `apps/web/tests/e2e/purchase-content.spec.ts`
