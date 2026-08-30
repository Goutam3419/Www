# Frontend Architecture

## Purpose

Define the structure of the Next.js/React client so Phase 1 implementation
has a fixed shape to build against.

## Scope

The `apps/` Next.js application only. Shared packages consumed by it are
described at the interface level; their internals live in `packages/README.md`
once populated in Phase 1.

## Overview

Next.js 15 with the App Router, React 19, TypeScript, and Tailwind CSS v4.
The client is organized around the screens defined in `specs/UI-Blueprint.md`
(Dashboard, Workspace, Editor, Chat, Preview, Deploy, Settings), each backed
by server components where data is read-heavy and client components where
interactivity (chat streaming, live preview, editor) is required.

State that must survive navigation (active project, active agent run) is held
in a workspace-scoped provider; ephemeral UI state stays local to each
screen. Real-time updates (agent progress, build logs) are delivered via a
streaming connection to the FastAPI gateway rather than polling.

## Dependencies

- `architecture/Backend-Architecture.md` (API contract)
- `specs/UI-Blueprint.md`
- `specs/Design-System.md`

## Future Work

- Offline/degraded-connectivity behavior
- Component-level accessibility audit checklist

## References

- `architecture/System-Architecture.md`
