# FLOW-042 Email Registration

1. User lands on `/register-email` (p42).
2. User enters email and taps send verification code.
3. System sends email code.
4. User enters verification code, password, and confirm password.
5. User taps complete registration.
6. If validation succeeds, system creates account and routes to `/auth-success` (p32).
7. If validation fails, page stays on p42 and shows error message.
