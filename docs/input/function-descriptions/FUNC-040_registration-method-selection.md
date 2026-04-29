# FUNC-040 Registration Method Selection

## Goal

Provide two registration entry methods and route user to selected registration form.

## Inputs

- Registration method selection (phone or email)
- Back action from header

## Behavior

1. Show two registration options on p40.
2. Selecting phone registration routes user to p41.
3. Selecting email registration routes user to p42.
4. Header back returns to previous page (p2).

## Error Cases

- Route transition failure
- Selected method temporarily unavailable
