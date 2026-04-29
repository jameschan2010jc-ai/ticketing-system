# Ticketing UI + Backend Design Monorepo

This repository is organized for end-to-end product delivery from provided design inputs:

Primary product context: customer-facing web ticket sales (browse events, select seats/tickets, checkout).

- UI images
- Function descriptions
- Page flows

## Stack

- Frontend: React + Tailwind CSS + TypeScript (Vite)
- Backend: Node.js (Express) + TypeScript
- Shared contracts: workspace package in `packages/shared-types`

## Project Layout

- `docs/input`: source product/design artifacts
- `docs/specs`: engineering-ready specs and traceability
- `apps/web`: frontend app
- `apps/admin`: admin console app
- `apps/api`: backend app
- `packages/shared-types`: API contracts and common types
- `infra`: deployment and CI assets

## Getting Started

1. Install dependencies from root:
   - `npm install`
2. Run web:
   - `npm run dev:web`
3. Run admin console:
   - `npm run dev:admin`
4. Run api:
   - `npm run dev:api`

For local, LAN, and internet deployment/startup scenarios, see:

- `docs/architecture/distribution-guide.md`

## Traceability

Start with:

- `docs/specs/requirements-traceability.md`

Each feature/page should map:

- Input artifact -> Specification -> Frontend implementation -> Backend implementation -> Tests
