# FUNC-002 Purchase Method Selection

## Goal

Let customer choose how to proceed with ticket purchase.

## Inputs

- Back action from header
- Three method options:
- existing account login
- new account registration
- direct purchase (guest flow)
- Bottom navigation actions (Home/Profile)

## Behavior

1. Render purchase method selection page with header title and 3 options.
2. Header back arrow returns to previous page.
3. Selecting existing account login routes to p30 (`/login-existing-account`).
4. Selecting new account registration routes to p40 (`/register-method`).
5. Selecting direct purchase routes to p3 (`/purchase-method/guest-notice`).
6. Bottom Home/Profile icons behave the same as p1.

## Error Cases

- Route target not available
