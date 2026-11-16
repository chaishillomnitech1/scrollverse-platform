# Omnitech1 Component Consolidation Baseline

**Status:** Initial evidence-backed baseline; not an authorization to alter protected production systems.  
**Date:** 2026-11-16  
**Scope:** Read-only review of the current `scrollverse-platform` main branch and selected open Agent 25 pull requests. This is not yet a complete audit of every repository, file, connected service, or credential.

## Operating doctrine

Build on what already exists. Inventory before implementation. Consolidate repeated duties only when their behavior and ownership are understood. Preserve source history and attribution. Implement changes on isolated branches, validate them, and submit reviewable pull requests. Never merge to protected branches or activate production without the required review and separate authorization.

## Verified baseline

The following were observed from GitHub during this review:

- The repository's default branch is `main`.
- Host-neutral staging gates are present in `server/agent25.aurellion.ts`: the trusted runtime must identify as staging, the AURELLION GitHub feature flag must be enabled, and the stage flag must equal staging. Missing/unknown deployment identity fails closed; a production Vercel marker blocks retrieval.
- The AURELLION reader is intentionally public-only, HTTPS GET-only, restricted to five exact paths in `chaishillomnitech1/scrollverse-ai-legion`, uses bounded file/total sizes, a five-minute in-process cache, and non-fatal fallback. It does not require a GitHub token.
- `.github/workflows/agent25-ci.yml` already uses frozen pnpm installation, the setup-node pnpm cache, concurrency cancellation, and runs typecheck, unit tests, and production build. Do not add a second competing CI workflow for the same checks without evidence that the current workflow misses a required path.
- `docs/AGENT25_AURELLION_GITHUB_STAGING.md` documents the host-neutral staging contract and explicitly says CI success does not mean staging infrastructure exists or is active.
- The inspected repository template embeds a package manifest with `check`, `test`, and `build` scripts. A root-level `package.json` was not found through the file fetch route during this inspection; confirm repository layout before attempting package-script automation.

## Consolidation candidates and decisions

| Candidate | Evidence | Proposed treatment | Gate |
|---|---|---|---|
| Agent 25 CI and build verification | Existing workflow already combines typecheck, tests, and build with pnpm caching and concurrency control. | Retain and extend the existing workflow only where a demonstrated gap exists; do not duplicate it. | Inspect full workflow triggers and verify all active source paths. |
| AURELLION public retrieval | Merged implementation already supersedes the earlier broader retrieval proposal in PR #8. | Treat the merged exact-path reader as the current implementation baseline. Compare older PR #8 for any unique, still-needed behavior before deciding whether to close or supersede it. | Human review before closing or rewriting existing PRs. |
| Methodigitology intent envelope | PR #7 remains an open draft, while the merged Agent 25 evidence boundary independently treats retrieved content as untrusted data. | Review whether the intent schema adds distinct visitor value or duplicates existing prompt/context handling. | Inspect patch and tests; no merge by title or assumption. |
| Federation envelope | PR #9 adds a versioned schema/validator and conformance tests, not a live transport. | Keep protocol validation separate from runtime transport; assess reuse by a future adapter rather than introducing a second envelope. | Compatibility and security review before integration. |
| Host/runtime portability | Staging identity is application-level and not tied to a single host. | Keep provider-specific deployment adapters behind a host-neutral contract; document capabilities and costs before selecting providers. | No production or DNS changes in this baseline. |
| Secrets and workload identity | Permanent key material is reported to exist in the user's GitHub/files archive; infrastructure registration is a separate state. | Inventory metadata and locations without printing or copying private key material. Prefer scoped identities and short-lived workload credentials for services. | Never expose secret values in reports, commits, logs, or chat. |

## Merge command model

The long-term interface should expose one orchestration entry point while keeping specialized tasks independently testable. Proposed command contract (design only; not implemented here):

```text
omni inspect --scope <repo|workspace|fleet>
omni build verify --target <local|staging>
omni consolidate plan --scope <repo|workspace|fleet>
omni evidence export --format <json|markdown>
```

A future `omni build verify` may coordinate repository state, dependency lockfile checks, typecheck, tests, build, security checks, and evidence capture. It must not silently deploy, change secrets, mutate production, or merge pull requests.

## Efficiency controls

1. Reuse existing provider connections and workflow caches.
2. Fetch only changed or missing evidence; cache immutable results by commit SHA where safe.
3. Avoid running identical checks twice for the same commit and workflow context.
4. Prefer event-driven triggers over redundant scheduled polling.
5. Keep one authoritative workflow per responsibility and call reusable scripts/actions from it.
6. Record runtime, API calls, cache hits, artifact size, and compute usage before claiming savings.
7. Keep vendor adapters replaceable; do not couple application identity or core interfaces to one host.

## Required evidence for every implementation PR

- Exact base and head commit SHAs.
- Files changed and reason each change is necessary.
- Tests added/updated and actual CI run URLs/results.
- Before/after behavior, including failure and rollback behavior.
- Cost/usage impact where measurable.
- Security and permission boundary review.
- Explicit statement of what was not changed.
- No production release, secret rotation, DNS change, or infrastructure spend without the applicable authorization.

## Current limitations

- The paginated GitHub repository listing returned 100 repositories at offset 0 and zero at offset 100; the accessible listing is complete as of 2026-11-16. See `docs/REPOSITORY_FLEET_INVENTORY_2026-11-16.md` for the full metadata inventory and provisional responsibility map.
- Repository-name categories are provisional. Content-level review is still required to establish canonical projects, mirrors, archives, production usage, and actual duplicated implementations.
- No full credential values were inspected or copied.
- No infrastructure was provisioned, no DNS was changed, no secrets were entered, and no production deployment or merge was performed.
- The daily 8:00 AM integrity automation has not been changed; its current definition must be retrieved through a working automation-management action before editing it. Do not create a duplicate schedule.

## Next implementation sequence

1. Complete content-level classification of the 100 listed repositories and identify authoritative projects versus archives, mirrors, templates, and experiments.
2. Compare overlapping PRs against merged code and workflow evidence.
3. Continue with the isolated reusable Node/pnpm setup consolidation proposed in `scrollverse_commerce` PR #76.
4. Capture passing CI evidence and review the PR before merge; keep production activation separate.
