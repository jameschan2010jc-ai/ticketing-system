# FLOW-060 Profile Entry (Logged-out)

1. User taps bottom Profile icon on any page.
2. System checks auth status.
3. If user is not logged in, system routes to `/profile-guest` (p60).
4. User can tap Login -> `/login-existing-account` (p30) or Register -> `/register-method` (p40).
