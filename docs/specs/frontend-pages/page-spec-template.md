# Frontend Page Spec Template

## Page ID

`PAGE-XXX`

## Input Artifacts

- UI image: `docs/input/ui-images/...`
- Page flow: `docs/input/page-flows/...`
- Function description: `docs/input/function-descriptions/...`

## Route

`/example-route`

## User Goal

Describe what the user should complete on this page.

## Responsive Priority

- 1st priority: Cell phone (small screens)
- 2nd priority: Tablet
- Define base styles for phone first, then add tablet enhancements using breakpoints.

## UI States

- Default
- Loading
- Empty
- Error
- Success

## Interactions

| Action | Trigger | Validation | API Call | Success Result | Error Handling |
| --- | --- | --- | --- | --- | --- |
| Submit form | Click button | Required fields | `POST /api/...` | Redirect to next page | Inline error message |

## Tracking Links

- Frontend code path: `apps/web/src/pages/...`
- Component path(s): `apps/web/src/components/...`
- Tests: `apps/web/tests/...`
