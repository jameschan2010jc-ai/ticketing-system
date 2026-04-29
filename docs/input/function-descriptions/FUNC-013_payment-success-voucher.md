# FUNC-013 Payment Success Voucher Display

## Goal

Show successful payment result and display usable QR ticket voucher.

## Inputs

- Payment result status
- Order number
- Visit date and time
- Ticket quantity
- QR code voucher content
- Ticket usage status

## Behavior

1. Load and display payment success summary.
2. Show QR code voucher and key ticket fields.
3. Show current ticket status (for example: unused).
4. User can tap `存儲到手機` to save voucher info locally.
5. Header back/Home/Profile actions remain available.

## Error Cases

- Payment result lookup failed
- QR code generation/load failed
- Save-to-device action failed
