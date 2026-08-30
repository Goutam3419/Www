# Multi-Agent Orchestration Workflow

The full LangGraph orchestration specification tying together every agent
defined in `architecture/Agent-Architecture.md`.

## Trigger

An approved Task graph from `workflows/Planning-Workflow.md`.

## Input

- Task graph
- Project memory (per `architecture/Memory-Architecture.md`)

## Output

- Completed, reviewed, tested, and (on approval) deployed Project changes

## Orchestration Graph

```mermaid
graph TD
    Planner --> Researcher
    Planner --> Designer
    Planner --> Coder
    Researcher --> Coder
    Designer --> Reviewer
    Coder --> Reviewer
    Reviewer -->|approved| Build
    Reviewer -->|rejected| Coder
    Build -->|pass| Test
    Build -->|fail| ErrorRecovery[Error Recovery]
    Test -->|pass| Preview
    Test -->|fail| Coder
    Preview -->|approved| Deploy
    Preview -->|rejected| Coder
    Deploy -->|success| Done[Deployed]
    Deploy -->|failure| Rollback
    ErrorRecovery --> Coder
```

## Decision Gates

Every gate defined individually in `workflows/Planning-Workflow.md` through
`workflows/Deploy-Workflow.md` applies here; this document is the composed
view, not a separate set of rules.

## Human Approval Points

Aggregated from each stage: intent confirmation, task graph approval, diff
review (optional), preview approval, deploy approval.

## Rollback Strategy

Each stage's own rollback strategy applies locally; at the orchestration
level, a failure at any stage returns control to the Coder or to the founder,
never silently continuing past a failed gate.

## References

- `architecture/Agent-Architecture.md`
- All other `workflows/` documents
