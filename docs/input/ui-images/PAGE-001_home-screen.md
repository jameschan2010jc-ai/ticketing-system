# PAGE-001 Home Screen

Source assets:

- `docs/input/ui-images/p1.pdf`
- `docs/input/ui-images/p1.txt`

Expected visible elements from input:

- Park name (top area)
- Park image block
- Park introduction text
- Open date range and ticket pricing
- Primary button: `Start Purchase`
- Bottom navigation icons:
  - Left icon: Home (returns to homepage)
  - Right icon: Profile (routes by auth status)

Flow note:

- Profile icon routes to p60 when logged out and p61 when logged in.

Data source note:

- Park name, park image, introduction, open date range, and pricing are fetched from backend APIs.
