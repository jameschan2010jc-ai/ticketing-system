# FUNC-061 Profile Center Menu (Logged-in)

## Goal

Show account summary and personal menu options for authenticated users.

## Inputs

- Current auth status (logged in)
- User profile summary data

## Behavior

1. When user taps profile icon and is logged in, route to p61.
2. Show user info and logged-in status.
3. Route options:
4. My orders -> p62
5. My tickets -> p63
6. Change password -> p33
7. Logout -> clear session and route to p1

## Error Cases

- User profile data load failure
- Logout API failure
- Route transition failure
