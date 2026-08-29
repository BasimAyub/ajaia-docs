# Ajaia Docs

Ajaia Docs is a focused collaborative document workspace inspired by Google Docs. It demonstrates rich-text editing, durable document storage, file import, sharing, and server-enforced owner/editor/viewer permissions without attempting a full document-suite clone.

## Live Demo

LIVE_URL_PLACEHOLDER

## Demo Identities

- Daniel Park: owns the primary demo documents and has editor access to Maya's research synthesis.
- Maya Singh: owns the research synthesis and has viewer access to Daniel's launch brief.
- Elena Rossi: starts with no documents to demonstrate empty states.

Use the **Demo identity** selector in the dashboard to switch among these seeded review identities. This is intentional mock authentication for reviewer convenience, not a real account system. Authorization is still enforced on the server for the selected identity.

## Reviewer Quick Test

1. As Daniel, create a document, format a line, and wait for the saved state.
2. Reload the page and confirm the content remains.
3. Share `Q3 Product Strategy` with Maya as a viewer.
4. Switch to Maya and confirm it appears under `Shared with me` as read-only.
5. Switch back to Daniel, open `Customer Research Synthesis`, edit it, then import a small `.md` file.

## Features

- Create, rename, save, and reopen documents.
- TipTap rich text: bold, italic, underline, headings, bullet lists, numbered lists, undo, and redo.
- Revision-aware autosave, manual save, and visible save state.
- `.txt` and `.md` import up to 250 KB into editable TipTap documents.
- Owner/editor/viewer sharing with server-side permission checks.
- Owned and shared document dashboards with seeded reviewer identities.
- Structured TipTap JSON persistence and plain-text dashboard previews.

## Local Setup

### Prerequisites

- Node.js 20 or later.
- A PostgreSQL database. A Neon database works for both local development and Vercel deployment.

### Install and Run

```bash
cp .env.example .env
# Add your PostgreSQL connection strings to .env.
npm install
npm run db:migrate:deploy
npm run db:seed
npm run dev
```

Open `http://localhost:3000`.

For a clean local reviewer state, use the destructive local-only reset command:

```bash
npm run db:reset
```

## Environment Variables

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Pooled PostgreSQL URL used by the Next.js application. |
| `DIRECT_URL` | Direct PostgreSQL URL used by Prisma migrations. It may match `DATABASE_URL` for a local database. |
| `NEXT_PUBLIC_APP_URL` | Local or deployed app URL used for public-facing configuration. |

No real credentials belong in tracked files.

## Tests and Verification

```bash
npm run prisma:validate
npm run prisma:generate
npm run typecheck
npm run lint
npm run test
npx playwright install chromium
npm run dev
# In another terminal:
npm run test:e2e
npm run build
```

The Playwright suite expects the app and a migrated, seeded PostgreSQL database to be running. It verifies persistence after reload, viewer behavior, shared-editor saves, Markdown import, and unsupported-file rejection.

## Deployment: Vercel + Neon

1. Create a Neon Postgres database and collect pooled and direct connection URLs.
2. Add `DATABASE_URL`, `DIRECT_URL`, and `NEXT_PUBLIC_APP_URL` to the Vercel project environment.
3. From a trusted environment with the direct URL, run `npm run db:migrate:deploy` once.
4. Run `npm run db:seed` once to create the review data.
5. Deploy the Next.js project to Vercel. The build generates Prisma Client but does not run destructive resets or migrations.

## Intentional Scope Cuts

- Seeded demo identities instead of real authentication.
- No simultaneous CRDT collaboration.
- No comments, suggestions, or version history.
- No `.docx` import or stored file attachments.
- No offline sync.

These choices keep the timebox focused on a reliable document workflow, durable persistence, and clear server-side access rules.
