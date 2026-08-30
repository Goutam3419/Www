# ADR-005: Supabase for Auth & Storage

## Context

The platform needs authentication, and storage for founder-uploaded assets
and encrypted secrets (`architecture/Security-Architecture.md`), without
building either from scratch in Phase 0/1.

## Decision

Adopt Supabase Auth for identity and Supabase Storage for file/asset and
encrypted-secret storage, alongside a separately managed PostgreSQL instance
for Project memory (`architecture/Memory-Architecture.md`).

## Consequences

Positive: mature, well-documented auth flows out of the box; storage with
built-in access-policy support that maps naturally onto the
Workspace/Brand/Project hierarchy. Negative: introduces a third-party
dependency for identity, which the Security Architecture must account for in
its threat model; requires clear boundaries between Supabase-managed data and
the primary PostgreSQL instance to avoid split-brain state.
