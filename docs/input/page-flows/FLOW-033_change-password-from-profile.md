# FLOW-033 Change Password from Profile

1. User opens `/change-password` (p33) from p61.
2. User requests and receives verification code.
3. User submits new password and confirmation.
4. If valid, system updates password and routes back to `/profile-center` (p61).
5. If invalid, page shows error and remains on p33.
