# FUNC-010 Purchase Content Selection

## Goal

Let customer select date, time, and one ticket type before confirming purchase.

## Inputs

- `visitDate` from calendar/date picker
- `visitTimeSlot` from available time options
- `ticketType` (single-select)
- Rule: max 1 ticket per purchase

## Behavior

1. Load selection options (date/time/ticket types) from backend.
2. Customer selects visit date.
3. Customer selects visit time slot.
4. Customer selects one ticket type.
5. Enable `確認購票` when required selections are complete.
6. Clicking `確認購票` sends confirm request.
7. Backend determines whether selected ticket type requires ID verification.
8. If verification is required, route to p50.
9. If verification is not required, continue existing flow to p11.
10. Bottom Home/Profile icons follow existing navigation rules.

## Error Cases

- No available date/time options
- Selected slot sold out before confirm
- Ticket type unavailable
- Backend validation failure on confirm
