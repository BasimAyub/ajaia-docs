# Architecture

## Goals

Deliver a small, trustworthy collaborative-document workflow: create and edit rich text, persist it durably, import text drafts, and share documents with clear server-enforced permissions.

## Architecture Overview

The app uses Next.js App Router and server actions for mutations. React client components provide the TipTap editor and responsive form feedback. Prisma accesses PostgreSQL. Vercel hosts the Next.js application; Neon Postgres stores durable reviewer data.

## Application Boundaries

- `app/page.tsx`: dashboard, document lists, creation, import, and demo identity selection.
- `app/documents/[id]/page.tsx`: protected document read route and editor workspace.
- `app/actions.ts`: validated server mutations for identity switching, creation, rename, save, import, and sharing.
- `lib/documents/permissions.ts`: centralized owner/editor/viewer policy.
- `lib/session.ts`: validated seeded demo-identity resolution.
- `lib/editor/content.ts`: TipTap JSON helpers and plain-text preview extraction.
- `prisma/`: PostgreSQL schema, initial migration, and idempotent demo seed.

## Data Model

`User` owns many `Document` records and can receive many `DocumentShare` records. A document has one owner and zero or more shares. A unique `(documentId, userId)` constraint prevents duplicate shares. Foreign keys cascade when a user or document is removed, preventing orphaned shares.

`DocumentShare.role` is either `EDITOR` or `VIEWER` through server-side validation. The owner is represented by `Document.ownerId`, not a share row.

## TipTap JSON Persistence

The editor stores serialized TipTap JSON in `Document.contentJson` instead of HTML. JSON preserves document structure, marks, heading levels, and list semantics without tying storage to a rendered HTML representation. `Document.plainText` is a derived preview used by dashboard cards and future search work.

## Authorization Model

- Owner: read, edit, rename, and share.
- Editor: read, edit, and rename.
- Viewer: read only.
- Other identities: no access.

The client hides unavailable controls for clarity, but server actions load the access record and call the centralized permission helpers before every mutation. The document route performs the same check before rendering content.

## Demo Identity Boundary

Identity is mocked for this assessment. A signed-in account system is intentionally out of scope; the dashboard stores one of three seeded identities in an HTTP-only demo cookie so reviewers can exercise the permission model quickly.

Authorization is real within that boundary: the server resolves the selected identity against the database, defaults safely if the cookie is invalid, and never trusts an arbitrary cookie value as a document owner or share recipient.

## File Import Strategy

Imports intentionally accept only `.txt` and `.md` files up to 250 KB. The server checks file size and extension before reading content, then converts basic headings and bullet lists to TipTap JSON. No arbitrary uploaded file is stored.

## Autosave Strategy

Edits increment a local revision counter. A debounced save captures one revision; if the user edits while that request is in flight, the older response cannot mark the newer revision as saved and a follow-up save is queued. A before-unload warning and best-effort flush reduce the risk of losing pending edits during navigation.

## Deployment Architecture

Vercel runs the Next.js application and server actions. Neon Postgres provides durable persistence. `DATABASE_URL` is the application connection string; `DIRECT_URL` is reserved for Prisma migration commands. The initial migration is committed under `prisma/migrations`, and the seed script is idempotent.

## Important Tradeoffs

Seeded identities make the sharing flow fast to evaluate but are not production authentication. PostgreSQL replaces local SQLite for deployment durability, while Prisma remains the single data-access layer. The app intentionally favors a reliable core loop over a broad document-suite feature list.

## Intentional Scope Cuts

- Real authentication and account management.
- CRDT-based real-time editing.
- Comments, suggestions, and version history.
- Share revocation and document deletion.
- `.docx` import, attachments, and offline sync.

## Production Evolution

With additional time, add authenticated sessions, share revocation, stronger content validation, targeted accessibility improvements, improved Markdown import fidelity, audit logs, and version history. Real-time collaboration should be considered only after product evidence shows it is needed.
