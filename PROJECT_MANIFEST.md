# Project Manifest — AI CEO Studio

## Current Phase

**Phase 0 — Architecture & Workflow Only — FROZEN**

A repair and validation pass (Phase 0.1) removed a stray folder-structure
artifact, upgraded all folder READMEs, rebuilt `DOCUMENT_REGISTRY.md`, and
produced `docs/reports/Phase0-Validation-Report.md` and
`docs/reports/PHASE0_FREEZE.md`, which together certify Phase 0 as complete.
See those two documents for full detail before starting Phase 1.

## Phase Plan

| Phase | Name | Scope | Status |
|---|---|---|---|
| 0 | Architecture & Workflow | Docs, diagrams, specs, ADRs, prompt library. Zero application code. | In progress |
| 1 | Core Runtime | Monorepo scaffold, FastAPI skeleton, Next.js skeleton, Postgres schema from Memory-Architecture.md | Not started |
| 2 | Agent Loop | LangGraph graph implementing Planner → Coder → Reviewer → Tester per Multi-Agent-Orchestration.md | Not started |
| 3 | Git Engine & Preview | Implementation of specs/Git-Engine.md, live preview pipeline | Not started |
| 4 | Deploy Pipeline | Vercel/Cloudflare deploy integration per Deploy-Workflow.md | Not started |
| 5 | UI Build-out | Screens from specs/UI-Blueprint.md using specs/Design-System.md tokens | Not started |

## Definition of Done — Phase 0

Phase 0 is complete only when all of the following are true:

- [x] All nine `architecture/` documents exist and are complete
- [x] All nine `workflows/` documents exist and are complete
- [x] LangGraph orchestration is fully specified (`architecture/Agent-Architecture.md`, `workflows/Multi-Agent-Orchestration.md`)
- [x] Memory model is documented (`architecture/Memory-Architecture.md`) with ER diagram
- [x] Git workflow is documented (`workflows/Git-Workflow.md`, `specs/Git-Engine.md`)
- [x] Design system is documented (`specs/Design-System.md`)
- [x] All five ADRs are complete (`decisions/ADR-001` through `ADR-005`)
- [x] Prompt library exists (`prompts/`, five role prompts — see open item in `docs/reports/PHASE0_FREEZE.md` re: Coder/Researcher/Tester prompts for Phase 1)
- [x] `DOCUMENT_REGISTRY.md` indexes every file in this repository
- [x] Zero application code has been written anywhere in the repository

All boxes are checked. Phase 0 is certified frozen per
`docs/reports/PHASE0_FREEZE.md`. Phase 1 may begin.

## Ownership

This manifest is the source of truth for phase status. Any change to phase
scope requires a new or amended ADR in `decisions/`.
