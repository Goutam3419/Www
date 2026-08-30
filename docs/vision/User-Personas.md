# User Personas

## Purpose

Ground UI, workflow, and approval-gate design in concrete users rather than an
abstract "user."

## Scope

Primary personas for v1. Does not cover team/enterprise multi-seat personas —
deferred to a later vision revision.

## Personas

**The Solo Founder** — has a product idea and domain expertise but limited or
no engineering background. Wants to go from idea to a live product without
hiring a team. Needs the CEO and Planner agents to translate vague intent into
concrete tasks, and needs approval gates that are understandable without
technical fluency.

**The Technical Co-founder** — can read code and infrastructure, wants to
supervise and occasionally override the agent team rather than do the work
manually. Needs the Human Override points defined per-agent in
`architecture/Agent-Architecture.md`, and needs visibility into build/test/
deploy logs via the Preview and Deploy workflows.

**The Indie Hacker** — building multiple small products in parallel, values
speed over ceremony. Needs the Workspace → Brand → Project hierarchy in
`architecture/Memory-Architecture.md` to keep projects cleanly separated
without re-explaining context each time.

## Dependencies

- `docs/vision/Problem-Statement.md`

## Future Work

- Persona validation against real Phase 1 pilot users

## References

- `specs/UI-Blueprint.md`
