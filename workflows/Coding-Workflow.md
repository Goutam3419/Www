# Coding Workflow

## Trigger

A Task is dequeued by the Coder agent from an approved Task graph.

## Input

- A single Task definition
- Relevant Project Files (via `architecture/Memory-Architecture.md`)
- Design spec from the Designer agent, if the task has a UI component

## Output

- A diff (create_file / update_file / delete_file operations, per
  `specs/Git-Engine.md`) implementing the task

## Decision Gates

1. **Stack conformance gate** — generated code must target only the locked
   tech stack.
2. **Self-check gate** — Coder agent runs a local build/lint pass before
   handing the diff to Reviewer.

## Human Approval Points

- Founder may inspect and edit the diff before it is committed, per the
  Coder's Human Override in `architecture/Agent-Architecture.md`.

## Rollback Strategy

On build/test failure, up to 3 retries against the same task before
escalating to Reviewer for manual triage; the diff is never committed until
it passes the Build and Test gates.

## References

- `specs/Git-Engine.md`
- `workflows/Build-Workflow.md`
