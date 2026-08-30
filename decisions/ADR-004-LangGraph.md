# ADR-004: LangGraph as the Orchestration Engine

## Context

Coordinating eight distinct agent roles (`architecture/Agent-Architecture.md`)
with explicit retry policies, human override points, and gated transitions
requires more structure than ad-hoc prompt chaining.

## Decision

Adopt LangGraph as the orchestration engine, modeling each agent role as a
graph node and each workflow document in `workflows/` as a subgraph or edge
set within the larger graph in `workflows/Multi-Agent-Orchestration.md`.

## Consequences

Positive: explicit, inspectable state machine for agent transitions;
built-in support for retries and human-in-the-loop interrupts matching the
Human Approval Points defined throughout `workflows/`. Negative: introduces a
dependency on LangGraph's own execution model and versioning; the team must
model Project memory (`architecture/Memory-Architecture.md`) in a way that's
compatible with LangGraph's state-passing conventions.
