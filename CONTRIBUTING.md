# Contributing — Phase 0

AI CEO Studio is currently in **Phase 0: Architecture & Workflow Only**. This
changes what a valid contribution looks like.

## The Golden Rule

Do not write application code. No React components, no FastAPI routes, no
backend implementation, no working scripts beyond repository scaffolding. If a
contribution includes runnable application logic, it does not belong in this
phase — open it against Phase 1 instead.

## What a Phase 0 Contribution Can Be

- A new or revised architecture document under `architecture/`
- A new or revised workflow document under `workflows/`
- A new or revised ADR under `decisions/`
- A new or revised spec under `specs/`
- A new or revised prompt under `prompts/`
- Mermaid diagrams embedded in any of the above
- Corrections or additions to `DOCUMENT_REGISTRY.md`

## Document Standards

Every architecture document must contain: Purpose, Scope, Dependencies, Future
Work, References.

Every workflow document must define: Trigger, Input, Output, Decision Gates,
Human Approval Points, Rollback Strategy.

Every ADR must follow: Context, Decision, Consequences.

## Review Checklist

Before submitting, confirm:

1. No application code was introduced.
2. The document follows the standard for its category (above).
3. `DOCUMENT_REGISTRY.md` is updated to reference the new/changed file.
4. Mermaid diagrams render without syntax errors.
5. The document does not silently change the locked tech stack — that requires
   a new ADR.

## Phase Transition

Contributions that assume Phase 1 has started (real code, real infra) should
be held until `PROJECT_MANIFEST.md` marks Phase 0's definition of done as
complete.
