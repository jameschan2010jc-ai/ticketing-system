# FLOW-041 Phone Registration

1. User lands on `/register-phone` (p41).
2. User enters phone number and taps send verification code.
3. System sends SMS code.
4. User enters verification code, password, and confirm password.
5. User taps complete registration.
6. If validation succeeds, system creates account and routes to `/auth-success` (p32).
7. If validation fails, page stays on p41 and shows error message.
