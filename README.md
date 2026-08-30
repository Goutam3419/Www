# AI CEO Studio

AI CEO Studio is an AI-native software factory: a multi-agent system that takes a
founder's prompt and turns it into a running, deployed product — planned, coded,
reviewed, tested, and shipped by a coordinated team of specialized agents.

This repository is currently in **Phase 0: Architecture & Workflow Only**. No
application code exists yet. Everything here is architecture, workflow
specification, and documentation that Phase 1 implementation will follow.

## What AI CEO Studio Is

A workspace-based platform where a user (the "Founder") describes a product in
natural language. A LangGraph-orchestrated agent team (CEO, Planner, Coder,
Designer, Researcher, Reviewer, Tester, DevOps) collaborates through defined
workflows — planning, coding, building, previewing, and deploying — with human
approval gates at every stage that matters.

## Repository Map

| Folder | Contents |
|---|---|
| `docs/` | Vision, problem statement, personas, success metrics |
| `architecture/` | System-level architecture documents (9 docs) |
| `workflows/` | Agent and pipeline workflow specifications (9 docs) |
| `decisions/` | Architecture Decision Records (ADRs) |
| `specs/` | Engineering specs: Git engine, tool registry, UI blueprint, design system |
| `prompts/` | System prompt library for each agent role |
| `packages/` | (Reserved for Phase 1) shared TypeScript/Python packages |
| `apps/` | (Reserved for Phase 1) Next.js frontend application |
| `server/` | (Reserved for Phase 1) FastAPI backend service |
| `infra/` | (Reserved for Phase 1) infrastructure-as-code |
| `docker/` | (Reserved for Phase 1) container definitions |
| `scripts/` | (Reserved for Phase 1) developer tooling scripts |
| `templates/` | (Reserved for Phase 1) project scaffolding templates |

See `DOCUMENT_REGISTRY.md` for a full index of every document in this
repository, and `PROJECT_MANIFEST.md` for the phase plan and definition of
done.

## Locked Tech Stack

Frontend: Next.js 15, React 19, TypeScript, Tailwind CSS v4
Backend: Python 3.12, FastAPI, PostgreSQL, Supabase Auth & Storage, Redis, Celery
Orchestration: LangGraph
Infra: Docker, Cloudflare, Vercel
Tooling: pnpm workspace (monorepo)

This stack is locked for Phase 0 and Phase 1 and is not to be changed without a
new ADR.

## Golden Rule for This Phase

**No application code.** Only architecture, workflows, documentation, file
blueprints, folder structure, Mermaid diagrams, specifications, ADRs, and the
prompt library. See `CONTRIBUTING.md` for how Phase 0 contributions are
reviewed against this rule.
