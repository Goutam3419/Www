# Runtime Architecture

## Purpose

Document the execution environments the system runs in: containers, language
runtimes, and the build/preview pipeline.

## Scope

Documentation of the intended runtime shape. No Dockerfiles or scripts are
produced in Phase 0 — those live in `docker/` and `scripts/` starting Phase 1.

## Overview

Three runtime surfaces:

1. **Python runtime** — Python 3.12, running the FastAPI gateway and Celery
   workers, containerized via Docker.
2. **Next.js runtime** — Node-based, deployed to Vercel for the studio's own
   client, and used again as the target runtime for founder-generated
   projects.
3. **Preview runtime** — an isolated, ephemeral container per founder project
   that runs the build pipeline (install → build → serve) and exposes a
   short-lived preview URL, torn down on inactivity or explicit rollback.

Log collection from all three surfaces is centralized so the Reviewer and
DevOps agents (see `architecture/Agent-Architecture.md`) can read build and
runtime errors without a human relaying them manually.

## Dependencies

- `architecture/Deployment-Architecture.md`
- `workflows/Build-Workflow.md`
- `workflows/Preview-Workflow.md`

## Future Work

- Resource-limit policy per preview container
- Cold-start optimization for preview generation

## References

- `architecture/System-Architecture.md`
