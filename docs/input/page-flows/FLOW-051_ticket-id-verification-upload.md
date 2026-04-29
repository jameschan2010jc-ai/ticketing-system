# FLOW-051 Ticket ID Verification Upload

1. User lands on `/ticket-verification-upload` (p51).
2. User uploads valid ID card image.
3. Backend processes verification.
4. If verification result is valid, system routes to `/ticket-verification-success` (p52).
5. If verification result is invalid, system routes to `/ticket-verification-failed` (p53).
