# ADR-002: React 19 on Next.js 15

## Context

The Frontend Architecture needs a component model that supports the
interactive, streaming-heavy screens in `specs/UI-Blueprint.md` (Chat,
Preview, Editor) without excessive client-side JavaScript.

## Decision

Adopt React 19 on Next.js 15's App Router, leaning on Server Components for
data-heavy screens (Dashboard, Workspace) and Client Components for
interactive/streaming surfaces (Chat, Preview, Editor).

## Consequences

Positive: smaller client bundles for read-heavy screens, first-class support
for streaming agent output into the UI. Negative: the Server/Client
Component boundary must be designed deliberately per screen (see
`architecture/Frontend-Architecture.md`), and the ecosystem for React 19 is
newer, so some third-party libraries may lag in compatibility.
