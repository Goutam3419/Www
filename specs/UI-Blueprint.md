# UI Blueprint

## Purpose

Define every screen in the AI CEO Studio client at the layout/component/
navigation/state level, without writing any React code.

## Scope

Screen specifications only. Visual tokens live in `specs/Design-System.md`.

## Screens

**Dashboard** — Layout: workspace overview grid. Components: Brand cards,
Project cards, "New Project" action. Navigation: entry point after login,
links into Workspace. States: empty (no projects yet), populated, loading.

**Workspace** — Layout: sidebar (Brands/Projects tree) + main content area.
Components: Brand/Project switcher, activity feed. Navigation: links into
Editor, Chat, and Settings for the selected Project. States: no brand
selected, brand selected with no projects, normal.

**Editor** — Layout: file tree + code/diff viewer. Components: file tree,
diff viewer, commit history panel (backed by `specs/Git-Engine.md`).
Navigation: reachable from Workspace; links to Preview. States: viewing
committed file, viewing pending diff, conflict state.

**Chat** — Layout: conversation thread + task/status sidebar. Components:
message thread, agent-status indicators (per
`architecture/Agent-Architecture.md` roles), approval-gate prompts.
Navigation: primary interaction surface for the Prompt-to-Project workflow.
States: awaiting founder input, agent working, awaiting approval.

**Preview** — Layout: embedded live preview frame + status bar. Components:
preview iframe, build/log viewer, approve/reject actions. Navigation: reached
after a successful Build per `workflows/Preview-Workflow.md`. States:
building, ready, failed.

**Deploy** — Layout: deployment status timeline. Components: environment
selector, deploy history, rollback action. Navigation: reached after Preview
approval. States: deploying, live, failed, rolled back.

**Settings** — Layout: form sections. Components: Workspace settings, Brand
settings, secrets manager (per `architecture/Security-Architecture.md`).
Navigation: reachable from Workspace at any time. States: default, saving,
error.

## Dependencies

- `architecture/Frontend-Architecture.md`
- `specs/Design-System.md`

## Future Work

- Mobile-responsive layout variants per screen
- Keyboard-navigation spec

## References

- `docs/vision/User-Personas.md`
