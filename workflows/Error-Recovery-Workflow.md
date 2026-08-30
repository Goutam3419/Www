# Error Recovery Workflow

## Trigger

Any Build, Test, or Deploy failure anywhere in the pipeline.

## Input

- The failing Build/Test/Deploy artifact and its logs
- The Task and diff that produced it

## Output

- Either a corrected diff resubmitted to `workflows/Build-Workflow.md`, or an
  escalation to the founder with a plain-language explanation

## Decision Gates

1. **Retryable gate** — determines whether the failure is transient (network,
   flaky test) or substantive (logic error), per the retry policy for the
   responsible agent in `architecture/Agent-Architecture.md`.
2. **Escalation gate** — after the agent's retry budget is exhausted, the
   error escalates up the chain (Coder → Reviewer → CEO → Founder).

## Human Approval Points

- Founder is shown the plain-language explanation before any escalated fix is
  attempted, and can accept a known failure rather than forcing a fix.

## Rollback Strategy

The Project always remains on its last known-good Build/Deployment while
recovery is attempted; nothing broken is ever promoted to Preview or
Production.

## References

- `architecture/Agent-Architecture.md`
- `workflows/Deploy-Workflow.md`
