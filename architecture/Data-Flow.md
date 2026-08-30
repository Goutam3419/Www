# Data Flow

## Purpose

Trace how a single founder request moves through the entire system, tying
together the Frontend, Backend, Agent, and Memory architectures.

## Scope

The canonical happy-path data flow for "founder submits a prompt to
completed deploy." Error paths are covered in
`workflows/Error-Recovery-Workflow.md`.

## Flow

```mermaid
sequenceDiagram
    participant U as Founder
    participant C as Next.js Client
    participant G as FastAPI Gateway
    participant O as LangGraph Orchestrator
    participant M as PostgreSQL (Memory)
    participant P as Preview Runtime
    participant D as Deploy Pipeline

    U->>C: Submit prompt
    C->>G: POST /projects/{id}/prompt
    G->>M: Persist Prompt entity
    G->>O: Enqueue orchestration run
    O->>M: Read Project memory (Files, Tasks, Errors)
    O->>O: CEO -> Planner -> Designer/Coder -> Reviewer -> Tester
    O->>M: Persist Task/File/Error/Build updates
    O->>P: Trigger preview build
    P-->>C: Stream build/preview status
    O->>D: On approval, trigger deploy
    D-->>C: Stream deploy status
    C-->>U: Live preview / deploy URL
```

## Dependencies

- `architecture/Agent-Architecture.md`
- `architecture/Memory-Architecture.md`
- `architecture/Runtime-Architecture.md`

## Future Work

- Data flow diagram for the error-recovery path
- Data flow diagram for multi-project (Brand-level) operations

## References

- `architecture/System-Architecture.md`
