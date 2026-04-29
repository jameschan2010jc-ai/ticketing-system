# FUNC-001 Homepage Display and Navigation

## Goal

Show park information on the homepage and let customer start the ticket purchase flow.

## Inputs/Data

- `parkName`
- `parkImageUrl`
- `parkIntro`
- `openDateRange`
- `ticketPriceInfo`

## Behavior

1. Load homepage and fetch park display data from backend.
2. Render park name, image, intro, open date range, and price info.
3. When user clicks `Start Purchase`, navigate to purchase method page (`/purchase-method`, p2).
4. Bottom-left Home icon keeps/returns user on homepage (`/`).
5. Bottom-right Profile icon checks login status and routes:
6. logged out -> `/profile-guest` (p60)
7. logged in -> `/profile-center` (p61)

## Error Cases

- Homepage data API timeout/failure
- Missing required homepage data fields
- Network/server failure
