# FUNC-033 Change Password from Profile

## Goal

Allow logged-in users to change password from personal center.

## Inputs

- `account`
- `verificationCode`
- `newPassword`
- `confirmPassword`

## Behavior

1. User opens p33 from p61.
2. User enters account and requests verification code.
3. User enters verification code, new password, and confirm password.
4. System validates code and password rules.
5. On success, password is updated and user is returned to p61.

## Error Cases

- Invalid account
- Verification code invalid or expired
- Password rule violation
- Confirm password mismatch
