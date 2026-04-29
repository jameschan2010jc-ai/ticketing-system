# FUNC-012 Payment Method Selection

## Goal

Let customer choose one payment method before payment result step.

## Inputs

- Payment method options from backend
- Selection action for one option
- Header back action and bottom Home/Profile actions

## Behavior

1. Load available payment methods.
2. Display `信用卡/簽帳卡` and `LINE PAY` options.
3. User selects one method.
4. Current development behavior: skip real payment processing and route directly to p13.
5. Page can be entered from p11 (order confirmation) or p52 (verification success).
6. Bottom Home/Profile icons follow existing navigation rules.

## Error Cases

- Payment method options not available
- Route transition failure
