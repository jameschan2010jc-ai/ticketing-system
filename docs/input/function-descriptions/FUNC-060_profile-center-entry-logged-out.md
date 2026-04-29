# FUNC-060 Profile Center Entry (Logged-out)

## Goal

Show profile center entry for guest users and guide to login or registration.

## Inputs

- Current auth status (not logged in)
- Profile icon tap event from footer

## Behavior

1. When user taps profile icon and is not logged in, route to p60.
2. Show logged-out summary and actions for login/register.
3. Tapping login routes to p30.
4. Tapping register routes to p40.
5. Home/Profile bottom nav follows global rules.

## Error Cases

- Auth state lookup fails
- Route transition failure
