# ADR-003: FastAPI as the Backend Framework

## Context

The backend needs to serve a typed REST + streaming API, integrate cleanly
with Python-native agent orchestration (LangGraph), and support async I/O for
Celery-backed background work.

## Decision

Adopt FastAPI (on Python 3.12) as the sole backend framework for the
`server/` application described in `architecture/Backend-Architecture.md`.

## Consequences

Positive: native async support, automatic OpenAPI schema generation for the
frontend contract, first-class Pydantic validation aligning well with
LangGraph's structured state. Negative: ties the backend to Python's async
ecosystem maturity for any future high-throughput requirements; requires
disciplined separation between the stateless API layer and the stateful
Orchestration Layer.
