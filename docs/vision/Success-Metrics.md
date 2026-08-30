# Success Metrics

## Purpose

Define how the team will know AI CEO Studio is working, at both the product
and the system level.

## Scope

Metrics for Phase 1 onward. Phase 0 has no runtime, so it has no metrics of
its own beyond the Definition of Done in `PROJECT_MANIFEST.md`.

## Metrics

**Time to first deploy** — elapsed time from a founder's initial prompt to a
live, reachable preview URL.

**Approval-gate friction** — number of times a human must intervene or reject
before a workflow completes, tracked per workflow (see Quality Gates in each
`workflows/` document).

**Rollback rate** — percentage of deploys that require the rollback strategy
defined in `workflows/Deploy-Workflow.md` to be invoked.

**Agent retry rate** — how often each agent role (per `architecture/Agent-Architecture.md`)
needs a retry before its output passes the relevant gate.

**Project memory integrity** — whether the memory hierarchy in
`architecture/Memory-Architecture.md` correctly reconstructs project state
after a crash or restart.

## Dependencies

- `architecture/Agent-Architecture.md`
- `workflows/` (all)

## Future Work

- Instrumentation plan once Phase 1 runtime exists
- Dashboard spec for founder-facing success metrics

## References

- `docs/vision/Vision-v1.0.md`
