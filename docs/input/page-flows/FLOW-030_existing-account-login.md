# FLOW-030 Existing Account Login

1. User lands on `/login-existing-account` (p30) from p2 first option.
2. User enters account and password.
3. User taps login button.
4. If credentials are valid, system routes to `/auth-success` (p32).
5. If credentials are invalid, page stays on p30 and shows error in lower area.
6. User can tap forget-password link to route to `/forget-password` (p31).
