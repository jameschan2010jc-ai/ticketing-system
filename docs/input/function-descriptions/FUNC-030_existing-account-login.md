# FUNC-030 Existing Account Login

## Goal

Authenticate existing customer account before entering purchase flow.

## Inputs

- `account` (phone or e-mail)
- `password`

## Behavior

1. User enters account and password, then taps login.
2. System verifies credentials through backend auth service.
3. On success, route to p32 success page.
4. On failure, display error message in lower area and ask user to re-enter account/password.
5. Tapping forget-password link routes user to p31.

## Error Cases

- Invalid account/password
- Account not found
- Account temporarily locked
- Auth service unavailable
