# ADR-001: Monorepo via pnpm Workspace

## Context

AI CEO Studio's own platform spans a Next.js frontend and a FastAPI backend,
plus shared types and utilities that both will need. Founder-generated
projects will also need scaffolding templates that live somewhere in this
same codebase during Phase 0/1 development.

## Decision

Adopt a single monorepo managed by a pnpm workspace, with `apps/` for
deployable applications, `packages/` for shared code, and `server/` for the
Python backend (managed separately from the pnpm workspace but colocated in
the same repository).

## Consequences

Positive: atomic commits across frontend/backend contract changes, shared
tooling and CI, single source of truth for the Document Registry. Negative:
requires disciplined workspace boundaries so `packages/` doesn't become a
dumping ground; Python and Node tooling must coexist in one repo without
conflicting.
