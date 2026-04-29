# FUNC-031 Forget Password Reset

## Goal

Allow user to reset password and return to login page.

## Inputs

- `account` (phone or e-mail)
- `verificationCode`
- `newPassword`
- `confirmPassword`

## Behavior

1. User enters account and requests verification code.
2. User enters received verification code.
3. User enters and confirms new password.
4. User taps complete button.
5. On success, system routes back to p30 login page.

## Error Cases

- Invalid account
- Invalid or expired verification code
- Password mismatch
- Password policy violation
- Reset service unavailable
