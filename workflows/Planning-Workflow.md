# Planning Workflow

## Trigger

CEO agent approves founder intent and hands off to the Planner (see
`architecture/Agent-Architecture.md`).

## Input

- Approved intent statement
- Existing Project Task graph, if any (for follow-up prompts)

## Output

- An ordered Task graph with dependencies, ready for Coding/Designing

## Decision Gates

1. **Dependency validity gate** — the Task graph must be a valid DAG (no
   cycles) before it can proceed.
2. **Scope gate** — each task must map to a single, reviewable unit of work;
   oversized tasks are split before approval.

## Human Approval Points

- Founder reviews and can reorder, add, or remove tasks before any Coder or
  Designer work begins.

## Rollback Strategy

Rejected task graphs return to the Planner with founder feedback attached;
up to 2 retries per `architecture/Agent-Architecture.md` before escalating to
the CEO agent.

## References

- `architecture/Agent-Architecture.md`
- `workflows/Coding-Workflow.md`
