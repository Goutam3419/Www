# Git Workflow

## Trigger

Any Coder-produced diff that has passed the Build and Test gates.

## Input

- A diff expressed as Git Engine operations (create_file, update_file,
  delete_file — see `specs/Git-Engine.md`)

## Output

- A commit on the Project's repository, and a pushed branch/ref ready for
  deploy

## Decision Gates

1. **Diff validity gate** — the diff must apply cleanly against the current
   tree.
2. **Commit message gate** — every commit must reference the Task it
   implements, for traceability back to `architecture/Memory-Architecture.md`.

## Human Approval Points

- Founder can review the diff before commit, per the Coder's Human Override.

## Rollback Strategy

Every commit is revertible via the Git Engine's `rollback` operation; a bad
commit never blocks the Project from returning to its previous commit state.

## References

- `specs/Git-Engine.md`
- `workflows/Coding-Workflow.md`
