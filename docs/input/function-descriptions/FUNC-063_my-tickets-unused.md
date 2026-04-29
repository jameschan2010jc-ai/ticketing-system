# FUNC-063 My Tickets (Unused)

## Goal

Show currently unused tickets and allow QR code viewing for entry.

## Inputs

- Authenticated user identity
- Ticket records filtered by unused status

## Behavior

1. Open My tickets page defaulting to Unused tab.
2. Display unused ticket list and quantity/date info.
3. Provide `View QR Code` action for each unused ticket item.
4. Switching to History tab routes/shows p64 state.

## Error Cases

- Ticket list API failure
- QR code generation/load failure
- Unauthorized access
