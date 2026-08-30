# Backend Architecture

## Purpose

Define the FastAPI service boundary and its relationship to the orchestration
and persistence layers.

## Scope

The `server/` FastAPI application. LangGraph internals are covered in
`architecture/Agent-Architecture.md`, not here.

## Overview

FastAPI exposes a REST + streaming API consumed by the Next.js client. It is
responsible for: authenticating requests (via Supabase Auth), validating
input, enqueuing orchestration work (via Celery/Redis), reading and writing
project state (via PostgreSQL), and streaming agent progress back to the
client over server-sent events.

The FastAPI layer itself holds no long-running agent logic — that lives in
the Orchestration Layer described in `architecture/Agent-Architecture.md`.
This keeps the API layer stateless and horizontally scalable independent of
agent execution.

## Dependencies

- `architecture/Agent-Architecture.md`
- `architecture/Memory-Architecture.md`
- `architecture/Security-Architecture.md`

## Future Work

- Rate limiting policy per workspace tier
- API versioning strategy

## References

- `architecture/System-Architecture.md`
- `specs/Tool-Registry.md`
