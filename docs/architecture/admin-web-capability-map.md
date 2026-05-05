# Admin Web Capability Map

This map tracks the implemented admin-console capabilities and their backend API dependencies.

## Park Management

| Capability | Admin API |
| --- | --- |
| List parks | `GET /api/v1/admin/parks` |
| Add park | `POST /api/v1/admin/parks` |
| Edit selected park profile | `PUT /api/v1/admin/park/profile` with `X-Park-Id` |
| Activate/deactivate park | `PATCH /api/v1/admin/parks/{parkId}/status` |
| Delete park | `DELETE /api/v1/admin/parks/{parkId}` |

## Ticket Catalog

| Capability | Admin API |
| --- | --- |
| List ticket types | `GET /api/v1/admin/ticket-types` with `X-Park-Id` |
| Add ticket type | `POST /api/v1/admin/ticket-types` with `X-Park-Id` |
| Edit ticket type | `PUT /api/v1/admin/ticket-types/{ticketTypeId}` |
| Activate/deactivate ticket type | `PATCH /api/v1/admin/ticket-types/{ticketTypeId}/status` |
| Delete ticket type | `DELETE /api/v1/admin/ticket-types/{ticketTypeId}` |

## Operations Tables

| View | Implemented Columns |
| --- | --- |
| Orders | Order number, user name, payment status, ticket type, ticket price, purchase date, admission date, admission time, verification data, QR code |
| Users | User name, registration type, registration date, last password change time, number of orders, total amount spent, total number of tickets, unused ticket count |

## Notes

- Admin list queries stay park-scoped through `X-Park-Id`.
- User accounts are global, while order/ticket summary metrics are computed for the selected park.
- Park deletion currently removes the park configuration and its ticket catalog records; historical commerce rows remain available for operational reporting.
