# FUNC-003 Guest Purchase Notice Acknowledgement

## Goal

Show unregistered purchase instructions and require acknowledgement before continuing.

## Inputs

- Notice content text
- Acknowledgement checkbox text
- Continue purchase button
- Header back action and bottom Home/Profile actions

## Behavior

1. Render guest purchase notice page with unregistered purchase notice title.
2. Continue button is disabled by default.
3. When checkbox is checked, enable continue button.
4. Clicking continue routes to p10 page (`/purchase-content`).
5. Header back, Home, and Profile actions follow existing navigation rules.

## Error Cases

- Notice content failed to load
- Continue route unavailable
