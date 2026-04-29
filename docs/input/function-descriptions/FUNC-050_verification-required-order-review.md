# FUNC-050 Verification Required Order Review

## Goal

Show selected ticket details and require user to start ID verification before payment.

## Inputs

- Selected order summary from p10
- Verification-required flag from backend

## Behavior

1. Render order summary (date/time/ticket info) and verification status.
2. Show verification reminder and constraints.
3. Tapping start verification routes to p51.
4. User can go back for modifications if needed.

## Error Cases

- Missing order context
- Verification flag mismatch
- Route transition failure
