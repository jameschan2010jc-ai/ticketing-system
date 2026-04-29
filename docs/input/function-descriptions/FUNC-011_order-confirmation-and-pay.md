# FUNC-011 Order Confirmation and Pay

## Goal

Show final order details and let customer confirm payment.

## Inputs

- `visitDate`
- `visitTime`
- `ticketInfo`
- `priceBreakdown`
- `noticeItems`
- `totalAmount`

## Behavior

1. Load order summary generated from p10 selections.
2. Display date/time/ticket info, fee details, notices, and total amount.
3. Tapping back arrow returns to p10 for edits.
4. Tapping `確認並付款` submits order confirmation and enters payment flow.
5. Bottom Home/Profile icons follow existing navigation rules.

## Error Cases

- Order summary not found or expired
- Price mismatch on confirm
- Payment initialization failure
