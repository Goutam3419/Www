# Build Workflow

## Trigger

A Reviewer-approved diff is ready to be compiled/built.

## Input

- Approved diff
- Current Project file tree

## Output

- A Build artifact (success or failure), logged against the Project per
  `architecture/Memory-Architecture.md`

## Decision Gates

1. **Build Gate** — the project must compile/build cleanly.
2. **Lint/type gate** — TypeScript and Python type checks must pass.

## Human Approval Points

None required for a successful build — this stage is fully automated. A
failed build routes to Error-Recovery, which may involve a human.

## Rollback Strategy

A failed build does not affect the last known-good Build artifact; the
Project remains servable from the previous successful Build while
`workflows/Error-Recovery-Workflow.md` runs.

## References

- `architecture/Runtime-Architecture.md`
- `workflows/Error-Recovery-Workflow.md`
