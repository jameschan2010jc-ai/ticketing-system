# FLOW-011 Order Confirmation and Pay

1. User lands on `/order-confirmation` (p11) after confirming purchase content in p10.
2. System loads and displays order summary sections and total amount.
3. User reviews date, time, ticket info, and fee details.
4. User taps confirm and pay button.
5. System validates latest order/price and creates payment intent/session context.
6. System routes user to `/payment-method` (p12).
