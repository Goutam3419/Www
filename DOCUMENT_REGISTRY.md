# Document Registry

Index of every document in the AI CEO Studio repository, verified against the
actual repository contents as of the Phase 0.1 repair pass. Update this file
whenever a document is added, renamed, or removed — Phase 0 is not complete
until this index matches the repository exactly.

Status legend: **Complete** — content matches its required format and is
internally consistent. **Placeholder** — intentionally empty per the Golden
Rule (reserved for a later phase). **Draft** — present but flagged for
expansion in `docs/reports/Phase0-Validation-Report.md`.

## Root

| File | Status |
|---|---|
| README.md | Complete |
| PROJECT_MANIFEST.md | Complete |
| DOCUMENT_REGISTRY.md | Complete |
| CONTRIBUTING.md | Complete |
| LICENSE_NOTE.md | Complete |

## docs/

| File | Status |
|---|---|
| docs/README.md | Complete |
| docs/vision/README.md | Complete |
| docs/vision/Vision-v1.0.md | Complete |
| docs/vision/Problem-Statement.md | Complete |
| docs/vision/Success-Metrics.md | Complete |
| docs/vision/User-Personas.md | Complete |
| docs/reports/README.md | Complete |
| docs/reports/Phase0-Validation-Report.md | Complete |
| docs/reports/PHASE0_FREEZE.md | Complete |

## architecture/

| File | Status |
|---|---|
| architecture/README.md | Complete |
| architecture/System-Architecture.md | Complete |
| architecture/Frontend-Architecture.md | Complete |
| architecture/Backend-Architecture.md | Complete |
| architecture/Runtime-Architecture.md | Complete |
| architecture/Agent-Architecture.md | Complete |
| architecture/Memory-Architecture.md | Complete |
| architecture/Deployment-Architecture.md | Complete |
| architecture/Security-Architecture.md | Complete |
| architecture/Data-Flow.md | Complete |

## workflows/

| File | Status |
|---|---|
| workflows/README.md | Complete |
| workflows/Prompt-to-Project.md | Complete |
| workflows/Planning-Workflow.md | Complete |
| workflows/Coding-Workflow.md | Complete |
| workflows/Build-Workflow.md | Complete |
| workflows/Error-Recovery-Workflow.md | Complete |
| workflows/Preview-Workflow.md | Complete |
| workflows/Deploy-Workflow.md | Complete |
| workflows/Git-Workflow.md | Complete |
| workflows/Multi-Agent-Orchestration.md | Complete |

## decisions/

| File | Status |
|---|---|
| decisions/README.md | Complete |
| decisions/ADR-001-Monorepo.md | Complete |
| decisions/ADR-002-React19.md | Complete |
| decisions/ADR-003-FastAPI.md | Complete |
| decisions/ADR-004-LangGraph.md | Complete |
| decisions/ADR-005-Supabase.md | Complete |

## specs/

| File | Status |
|---|---|
| specs/README.md | Complete |
| specs/Git-Engine.md | Complete |
| specs/Tool-Registry.md | Complete |
| specs/UI-Blueprint.md | Complete |
| specs/Design-System.md | Complete |

## prompts/

| File | Status |
|---|---|
| prompts/README.md | Complete |
| prompts/CEO-Prompt.md | Complete |
| prompts/Planner-Prompt.md | Complete |
| prompts/Designer-Prompt.md | Complete |
| prompts/Reviewer-Prompt.md | Complete |
| prompts/DevOps-Prompt.md | Complete |

Note: `architecture/Agent-Architecture.md` defines eight agent roles (CEO,
Planner, Coder, Designer, Researcher, Reviewer, Tester, DevOps). The prompt
library above covers the five roles originally scoped for Phase 0. Coder,
Researcher, and Tester prompts are not yet written — see
`docs/reports/Phase0-Validation-Report.md` for this as a flagged WARNING,
not a blocking FAIL, since the original Phase 0 scope named only five.

## Reserved (Phase 1+, placeholders in Phase 0)

| File | Status |
|---|---|
| packages/README.md | Placeholder |
| apps/README.md | Placeholder |
| server/README.md | Placeholder |
| infra/README.md | Placeholder |
| docker/README.md | Placeholder |
| scripts/README.md | Placeholder |
| templates/README.md | Placeholder |

## Totals

- Documents indexed above: 58
- Duplicate entries: 0
- Broken references found during Phase 0.1 validation: 0
