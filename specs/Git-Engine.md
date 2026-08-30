# Git Engine Spec

## Purpose

Define the contract for the Git Engine: the abstraction every agent uses to
read and modify a Project's repository, without any agent calling raw git
commands directly.

## Scope

Operation contracts only. No implementation code — this spec is what Phase 1
implements against.

## Operations

| Operation | Description |
|---|---|
| `create_file(path, content)` | Create a new file at `path` with `content`. Fails if the file already exists. |
| `update_file(path, content)` | Replace the full content of an existing file. Fails if the file does not exist. |
| `delete_file(path)` | Remove a file from the tree. |
| `diff(from_ref, to_ref)` | Compute a diff between two refs (or working tree vs a ref). |
| `commit(message, task_id)` | Commit staged changes, tagging the commit with the originating Task per `architecture/Memory-Architecture.md`. |
| `push(branch)` | Push a branch to the Project's remote. |
| `pull(branch)` | Fetch and merge/rebase a branch from the remote. |
| `rollback(ref)` | Revert the working tree to a prior ref, used by `workflows/Error-Recovery-Workflow.md` and `workflows/Deploy-Workflow.md`. |

## Dependencies

- `workflows/Git-Workflow.md`
- `architecture/Memory-Architecture.md`

## Future Work

- Conflict-resolution contract for concurrent Coder tasks on overlapping files
- Signed-commit policy

## References

- `architecture/Security-Architecture.md`
