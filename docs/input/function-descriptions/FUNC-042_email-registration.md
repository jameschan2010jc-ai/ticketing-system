# FUNC-042 Email Registration

## Goal

Register a new account by email with verification code.

## Inputs

- `email`
- `verificationCode`
- `password`
- `confirmPassword`

## Behavior

1. User enters email and requests verification code.
2. System sends one-time verification code to the email address.
3. User enters received code and password fields.
4. System validates code and password rules.
5. On success, create account and route to p32.

## Error Cases

- Invalid email format
- Verification email send failed
- Verification code incorrect or expired
- Password invalid (not 8-20 alphanumeric)
- Password and confirm-password mismatch
- Account already exists
