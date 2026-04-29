# FLOW-010 Purchase Content Selection

1. User lands on `/purchase-content` (p10).
2. System fetches available visit dates, time slots, and ticket types.
3. User selects visit date from calendar.
4. User selects visit time.
5. User selects one ticket type.
6. User taps confirm purchase button.
7. System validates selections and evaluates `requiresIdVerification` from backend.
8. If `requiresIdVerification = true`, system routes to `/verification-required-order` (p50).
9. If `requiresIdVerification = false`, system routes to `/order-confirmation` (p11).
