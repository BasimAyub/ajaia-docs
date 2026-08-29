# Ajaia AI-Native Full Stack Developer Assignment

Candidate: Basim Ayub

## Live Product

https://ajaia-docs-nu-pearl.vercel.app/

## Walkthrough

https://www.loom.com/share/922de468b23e41cfbcbe59a0dc5900fa

## Demo Identities

- Daniel Park: primary owner and shared editor.
- Maya Singh: document owner and shared viewer.
- Elena Rossi: empty-state identity.

Use the dashboard's **Demo identity** selector. This intentional mock-auth boundary lets reviewers exercise real server-enforced owner/editor/viewer rules without account setup.

## What Is Included

- Rich-text document creation, rename, autosave, manual save, and reopen.
- Structured TipTap JSON persistence with dashboard previews.
- `.txt` and `.md` import up to 250 KB.
- Owner/editor/viewer sharing with server-side authorization.
- PostgreSQL-ready Prisma migration and idempotent reviewer seed data.
- Focused permission unit tests and Playwright workflow coverage.

## Reviewer Test Flow

1. As Daniel, create and edit a document; wait for the saved state and reload.
2. Share `Q3 Product Strategy` with Maya as viewer.
3. Switch to Maya; open the shared document and confirm it is read-only.
4. As Daniel, edit `Customer Research Synthesis`, which Maya shared with him as editor.
5. Import a small Markdown file and continue editing it.

## Engineering Highlights

- Every mutation validates input and checks permissions on the server.
- Demo identity resolution validates the seeded user against the database before writes.
- Autosave uses revisions so an earlier response cannot falsely mark newer changes as saved.
- PostgreSQL migration and seed workflow are safe to repeat without duplicate users, shares, or seed documents.

## Intentional Scope Cuts

No real authentication, comments, version history, CRDT collaboration, `.docx` import, attachments, or offline sync.

## Known Limitations

- Demo identity selection is not suitable for real user data.
- Markdown import supports only basic headings and bullet lists.
- Autosave is last-write-wins rather than collaborative conflict resolution.

## What I Would Build With Another 2–4 Hours

- Share revocation and ownership-transfer safeguards.
- Stronger session/authentication boundaries for real users.
- Targeted accessibility polish and keyboard-flow testing.
- Better Markdown import fidelity.
- Version history for recovery and auditability.

## Verification Performed

- Prisma schema validation and client generation.
- TypeScript typecheck and ESLint.
- Permission unit tests.
- Production build.
- Playwright persistence, sharing/viewer, shared-editor, and import flows are included and ready to run against a migrated, seeded PostgreSQL database with Chromium installed.
- The documented reviewer smoke path should be completed against the deployed product before submission.
