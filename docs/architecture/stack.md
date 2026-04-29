# Chosen Stack (Default)

## Frontend

- Framework: React (Vite)
- Styling: Tailwind CSS
- Language: TypeScript
- Suggested testing: Vitest (unit), Playwright (e2e)
- Apps: customer web in `apps/web`, admin console in `apps/admin`

## Backend

- Runtime: Node.js
- Framework: Express
- Language: TypeScript
- Suggested testing: Jest + Supertest

## Why This Pairing

- Strong TypeScript support across frontend and backend.
- Lightweight frontend and backend setup for fast iteration.
- Easy API contract sharing through `packages/shared-types`.

## Naming and Ownership

- Frontend page modules: `apps/web/src/pages/<feature>`
- Backend route modules: `apps/api/src/routes/<feature>.route.ts`
- Shared contracts: `packages/shared-types/src/<feature>.ts`
