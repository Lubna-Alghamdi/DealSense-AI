# DealSense AI

A supplier-comparison app. Create a purchase comparison, add supplier quotations
by hand or by CSV/XLSX upload, compare suppliers on total cost, delivery, and a
balanced score, simulate decision priorities, and export a report (web or PDF).

## Develop locally

```bash
cp .env.example .env
corepack enable
pnpm install
pnpm dev
```

`.env.example` sets `AUTH_DISABLED=true` as a commented-out option; uncomment it
to skip sign-in while developing.

## Project layout

- `app/routes/`: pages (`/`, `/create`, `/suppliers`, `/dashboard`, `/simulator`, `/report`)
- `app/components/`: shared UI (`app-ui.tsx`, `layout/`, `ui/` primitives)
- `app/hooks/`: React Query hooks over the app actions
- `app/lib/`: comparison math, supplier import parsing, report assumptions, PDF export
- `actions/`: operations used by the UI and the app's agent
- `drizzle/`: database schema and migrations
- `server/`: server plugins and the database client
- `scripts/`: production migration helpers

Agent and framework guidance lives in `AGENTS.md` and `AI/DEVELOPING.md`.
