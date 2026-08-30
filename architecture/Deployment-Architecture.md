# Deployment Architecture

## Purpose

Describe where and how both the AI CEO Studio platform itself, and the
projects it generates for founders, get deployed.

## Scope

Deployment topology and responsibilities. Step-by-step deploy mechanics are
in `workflows/Deploy-Workflow.md`.

## Overview

The Studio platform's own frontend deploys to **Vercel**; its FastAPI backend
and Celery workers run in **Docker** containers behind **Cloudflare**, which
also provides CDN and DDoS protection at the edge. PostgreSQL and Redis run as
managed services reachable only from the backend's private network.

Founder-generated projects follow the same pattern by default (Vercel for
frontend, Cloudflare in front), since that is the platform's own locked
stack, but the Deployment-Architecture is written so that target could be
made pluggable in a later phase without changing the Agent or Workflow
layers.

## Dependencies

- `architecture/Runtime-Architecture.md`
- `architecture/Security-Architecture.md`

## Future Work

- Pluggable deploy targets (beyond Vercel/Cloudflare) for founder projects
- Blue/green deploy strategy for the Studio platform itself

## References

- `workflows/Deploy-Workflow.md`
- `decisions/ADR-005-Supabase.md`
