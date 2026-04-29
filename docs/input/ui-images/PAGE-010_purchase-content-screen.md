# PAGE-010 Purchase Content Screen

Source assets:

- `docs/input/ui-images/p10.pdf`
- `docs/input/ui-images/p10.txt`

Expected visible elements from input:

- Header:
- Left: back arrow icon
- Center title: select purchase content
- Section 1: visit date
- Date picker/calendar for selecting date
- Section 2: visit time
- Time slot selector (example shown: `09:00-17:00`)
- Section 3: ticket type (single-select)
- Ticket type selector with limit note (each purchase limited to 1 ticket)
- Primary action button: confirm purchase
- Bottom section same as p1:
- Home icon
- Profile icon

Flow note:

- After confirm, backend decides next page.
- If selected ticket requires ID verification, route to p50.
- Otherwise route to p11.

Data source note:

- Available dates, time slots, ticket types, and verification-required rules are fetched from backend.
