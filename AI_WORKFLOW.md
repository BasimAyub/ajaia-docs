# AI Workflow

## Tools Used

Codex, an AI coding agent, was used as a pair-programming and review tool during this assignment.

## Where AI Accelerated Work

- Turned the ambiguous prompt into a disciplined document-workspace scope.
- Helped scaffold focused Next.js, Prisma, TipTap, and test components.
- Identified permission, persistence, import, and autosave edge cases during review.
- Helped draft candidate test cases and submission documentation.

## Human-Owned Decisions

The final product decisions remained mine: use seeded identities rather than half-built authentication; persist structured TipTap JSON; centralize authorization; use PostgreSQL for hosted durability; focus on document sharing rather than real-time editing; and keep the existing restrained workflow-first UI.

## AI Output Rejected or Changed

I rejected expanding the assignment into real-time CRDT collaboration and a full authentication system. Those additions would increase delivery risk without strengthening the required core slice: document creation, editing, persistence, import, sharing, and access control.

I also treated AI-generated implementation suggestions as candidates, then adapted them to the existing repository structure and verified each behavioral claim rather than accepting them wholesale.

## Verification

The final workflow is verified with Prisma schema validation and client generation, TypeScript type checking, linting, permission unit tests, Playwright end-to-end tests when browsers and PostgreSQL are configured, production build checks, and a manual reviewer smoke path.
