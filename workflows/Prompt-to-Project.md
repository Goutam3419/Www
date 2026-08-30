# Prompt-to-Project Workflow

The top-level workflow: everything else in `workflows/` is a stage inside
this one.

## Trigger

A founder submits an initial natural-language prompt describing a product
idea, either for a brand-new Project or as a follow-up prompt on an existing
one (see `architecture/Memory-Architecture.md` for the Workspace/Brand/Project
hierarchy).

## Input

- Raw founder prompt text
- Existing Project memory, if any (Files, Tasks, Prompts, Errors, Builds,
  Deployments)

## Output

- A Task graph handed to `workflows/Planning-Workflow.md`
- Eventually: a deployed, reachable project (via
  `workflows/Deploy-Workflow.md`)

## Decision Gates

1. **Intent clarity gate** — CEO agent determines whether the prompt is
   specific enough to plan against, or needs a clarifying question.
2. **Stack compatibility gate** — confirms the request is buildable within
   the locked tech stack; if not, the founder is told directly rather than
   silently substituted.

## Human Approval Points

- Founder confirms the CEO agent's restated understanding of intent before
  Planning begins.

## Rollback Strategy

If the founder rejects the restated intent, the workflow resets to intent
collection with no Task graph created — nothing downstream has been touched
yet, so there is nothing to roll back.

## References

- `architecture/Agent-Architecture.md`
- `workflows/Planning-Workflow.md`
