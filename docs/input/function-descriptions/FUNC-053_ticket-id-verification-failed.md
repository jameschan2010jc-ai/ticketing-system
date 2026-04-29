# FUNC-053 Ticket ID Verification Failed

## Goal

Inform user verification failed and provide retry path.

## Inputs

- Verification result status = invalid
- Failure reasons list from backend

## Behavior

1. Display failure icon and failure reasons.
2. Display guidance to upload valid and clear ID document.
3. User taps re-upload button.
4. System routes back to p51 for retry.

## Error Cases

- Failure reason unavailable
- Retry route transition failure
