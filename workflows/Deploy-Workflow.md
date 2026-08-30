# Deploy Workflow

## Trigger

Founder approves a Preview per `workflows/Preview-Workflow.md`.

## Input

- Approved Build artifact
- Target deployment configuration (Vercel/Cloudflare, per
  `architecture/Deployment-Architecture.md`)

## Output

- A live Production deployment, or a rolled-back state on failure

## Decision Gates

1. **Approval Gate** — founder's explicit go-ahead is required; no automatic
   promotion from Preview to Production.
2. **Security Gate** — secrets and access scopes are validated per
   `architecture/Security-Architecture.md` before deploy.
3. **Deploy Gate** — the deploy pipeline itself must complete and pass a
   post-deploy health check.

## Human Approval Points

- Explicit founder approval before deploy starts (Approval Gate above).
- DevOps agent's one automatic retry on transient failure is visible to the
  founder in real time.

## Rollback Strategy

On post-deploy health check failure, DevOps agent automatically reverts to
the last known-good Deployment (per `architecture/Memory-Architecture.md`'s
Deployment history) and notifies the founder.

## References

- `architecture/Deployment-Architecture.md`
- `architecture/Agent-Architecture.md`
