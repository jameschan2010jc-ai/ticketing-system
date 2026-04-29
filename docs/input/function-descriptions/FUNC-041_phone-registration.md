# FUNC-041 Phone Registration

## Goal

Register a new account by phone number with verification code.

## Inputs

- `phone`
- `verificationCode`
- `password`
- `confirmPassword`

## Behavior

1. User enters phone number and requests verification code.
2. System sends one-time verification code by SMS.
3. User enters received code and password fields.
4. System validates code and password rules.
5. On success, create account and route to p32.

## Error Cases

- Invalid phone format
- SMS send failed
- Verification code incorrect or expired
- Password invalid (not 8-20 alphanumeric)
- Password and confirm-password mismatch
- Account already exists
