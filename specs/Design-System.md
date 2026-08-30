# Design System

## Purpose

Define the token-based design system every screen in `specs/UI-Blueprint.md`
draws from, so visual decisions are made once and referenced everywhere.

## Scope

Design tokens only — no component code.

## Tokens

**Typography** — A single type scale (display, heading-1 through heading-4,
body, caption) built on one sans-serif family for UI text and one monospace
family for code/diff views (Editor screen).

**Spacing** — A base-4px spacing scale (4, 8, 12, 16, 24, 32, 48, 64) used for
all padding/margin/gap values across screens.

**Radius** — Three radii tiers: small (inputs, chips), medium (cards, panels),
large (modals, the Preview frame).

**Shadows** — Two elevation levels: a subtle resting shadow for cards, and a
raised shadow for modals/overlays. No shadow on inline/embedded elements like
the Editor's diff viewer.

**Colors** — A neutral base palette for layout/chrome, a single accent color
for primary actions and agent-status highlights, and semantic colors for
success/warning/error states (used heavily in Build, Test, and Deploy
status indicators).

**Motion** — Short, purposeful transitions only: fades for content swaps,
no bouncing/elastic easing. Agent-status changes (per
`architecture/Agent-Architecture.md`) animate with a subtle pulse rather than
a jarring state swap.

**Icons** — A single icon set used consistently across all screens; agent
roles (CEO, Planner, Coder, Designer, Researcher, Reviewer, Tester, DevOps)
each get one fixed icon for recognizability in the Chat and Workspace
screens.

## Dependencies

- `specs/UI-Blueprint.md`

## Future Work

- Dark mode token mapping
- Token export format for Tailwind CSS v4 config (Phase 1)

## References

- `architecture/Frontend-Architecture.md`
