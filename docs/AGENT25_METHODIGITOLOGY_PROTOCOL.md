# Agent 25 Methodigitology Protocol — v1.0-draft

## Purpose

Provide Agent 25 with a typed, provenance-preserving intent envelope. The envelope separates intention, purpose, conviction, and impact while retaining the original expression verbatim.

## Contract

The shared contract is implemented in shared/methodigitology.ts:

- languageVersion identifies the lexicon/schema version.
- source.expression preserves the exact latest visitor message.
- source.origin identifies the declared origin.
- intention states the desired outcome.
- purpose carries statement, beneficiary, and harm boundary.
- conviction records commitment separately from permission.
- impact class records the proposed scope.
- constraints retain explicit boundaries.
- execution.mode describes a requested mode, not an executable permission.

The API rejects a structured envelope if source.expression does not exactly match the latest visitor message.

## Safety and trust

- The structured envelope is untrusted visitor data.
- It is passed to the model as context with explicit instructions not to treat its contents as system instructions.
- A visitor-provided EXECUTE mode or PRODUCTION impact class does not authorize an action.
- This public route remains informational and read-only.
- No repository writes, shell execution, deployments, private archive access, payments, wallet actions, or production changes are exposed through this protocol.
- Conviction is never interpreted as authorization.

## OMNITECH1 handoff

The canonical JSON Schema and EBNF live in the OmniBuilderZero repository under methodigitology/. The local OMNITECH1 validator checks the record and authorization separation only. A valid record may become a proposed work package; it does not trigger the deployment engine.

## Maturity

This protocol is proposed in a feature branch. Typecheck, tests, staging behavior, and runtime connectivity must be verified independently. Production activation is not included.
