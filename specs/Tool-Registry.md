# Tool Registry

## Purpose

Catalogue every tool an agent can invoke, so the Agent Architecture and
Workflow documents can refer to tools by name without redefining them
per-document.

## Scope

Tool contracts and purposes only, not implementations.

## Registry

| Tool | Purpose |
|---|---|
| `FileCreate` | Create a file in the Project tree (wraps Git Engine `create_file`) |
| `FileUpdate` | Modify an existing file (wraps Git Engine `update_file`) |
| `FileDelete` | Remove a file (wraps Git Engine `delete_file`) |
| `TerminalRun` | Execute a build/lint/test command inside the Project's runtime container |
| `Preview` | Request a live preview build per `workflows/Preview-Workflow.md` |
| `Deploy` | Trigger a deploy per `workflows/Deploy-Workflow.md` |
| `WebSearch` | Used by the Researcher agent to gather external information |
| `MemoryRead` | Read Project memory (Files, Tasks, Prompts, Errors, Builds, Deployments) |
| `MemoryWrite` | Persist updates to Project memory |
| `HumanAsk` | Surface a question or approval request to the founder |

## Dependencies

- `architecture/Agent-Architecture.md`
- `specs/Git-Engine.md`

## Future Work

- Per-tool rate limits and cost accounting
- Tool permission matrix per agent role

## References

- `architecture/Backend-Architecture.md`
