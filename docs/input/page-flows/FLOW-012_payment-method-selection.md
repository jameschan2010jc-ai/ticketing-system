# FLOW-012 Payment Method Selection

1. User lands on `/payment-method` (p12) from p11 or p52.
2. System shows available payment methods.
3. User selects one payment method.
4. Current development behavior: skip actual payment process.
5. System routes user to `/payment-success` (p13).
