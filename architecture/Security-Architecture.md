# Security Architecture

## Purpose

Define authentication, authorization, isolation, and secrets handling across
the system.

## Scope

Platform-level security architecture. Does not cover security review of
founder-generated application code — that is a Reviewer-agent workflow
concern (`workflows/Coding-Workflow.md`), not a platform architecture concern.

## Overview

**AuthN/Z**: Supabase Auth issues identity for founders; the FastAPI gateway
validates tokens on every request and scopes all data access to the
authenticated Workspace (see `architecture/Memory-Architecture.md`).

**Isolation**: Each Project's preview and build runtime executes in its own
container with no shared filesystem or network access to other Projects'
containers.

**Secrets**: Founder-provided secrets (API keys for third-party services their
project uses) are stored via Supabase Storage's encrypted layer and injected
into the relevant runtime container at execution time only — never persisted
into Git history managed by the Git Engine.

**Agent boundaries**: No agent (see `architecture/Agent-Architecture.md`) has
direct production credentials; the DevOps agent's deploy actions are brokered
through the platform's own service credentials, scoped per Workspace.

## Dependencies

- `architecture/Backend-Architecture.md`
- `architecture/Memory-Architecture.md`
- `decisions/ADR-005-Supabase.md`

## Future Work

- Formal threat model
- Secrets rotation policy

## References

- `specs/Git-Engine.md`
