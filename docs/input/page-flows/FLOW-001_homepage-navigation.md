# FLOW-001 Homepage Navigation

1. User opens `/` (homepage).
2. System fetches and displays park name, park image, intro, open date range, and ticket pricing.
3. User clicks `Start Purchase`.
4. System routes user to `/purchase-method` (p2).
5. If user clicks bottom Home icon, system stays on or returns to `/`.
6. If user clicks bottom Profile icon, system checks auth state.
7. If not logged in, system routes to `/profile-guest` (p60).
8. If logged in, system routes to `/profile-center` (p61).
