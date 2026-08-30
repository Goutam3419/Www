# Preview Workflow

## Trigger

A successful Build artifact per `workflows/Build-Workflow.md`.

## Input

- Successful Build artifact
- Runtime configuration from `architecture/Runtime-Architecture.md`

## Output

- A live, short-lived Preview URL the founder can open and interact with

## Decision Gates

1. **Boot gate** — the preview container must start and pass a basic health
   check before the URL is surfaced.
2. **Isolation gate** — the preview must run in its own container with no
   access to other Projects, per `architecture/Security-Architecture.md`.

## Human Approval Points

- Founder reviews the live preview before approving promotion to
  `workflows/Deploy-Workflow.md`.

## Rollback Strategy

Preview containers are ephemeral and torn down on inactivity or explicit
founder rejection; rejecting a preview never affects the last deployed
Production version.

## References

- `architecture/Runtime-Architecture.md`
- `workflows/Deploy-Workflow.md`
