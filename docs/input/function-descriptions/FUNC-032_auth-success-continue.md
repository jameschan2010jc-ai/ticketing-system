# FUNC-032 Auth Success Continue

## Goal

Show successful authentication state and continue to ticket purchase flow.

## Inputs

- Success status from login or registration flow
- Continue action

## Behavior

1. Display success message after successful authentication.
2. Support entry from p30 login success and p41/p42 registration success.
3. User taps continue button.
4. System routes to p10 purchase-content page.

## Error Cases

- Missing auth success context
- Route transition failure
