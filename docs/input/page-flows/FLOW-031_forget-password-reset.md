# FLOW-031 Forget Password Reset

1. User lands on `/forget-password` (p31) from p30 forget-password link.
2. User enters account and requests verification code.
3. User enters verification code and new password twice.
4. User taps complete button.
5. If reset succeeds, system routes back to `/login-existing-account` (p30).
6. If reset fails, page stays on p31 and shows validation/error message.
