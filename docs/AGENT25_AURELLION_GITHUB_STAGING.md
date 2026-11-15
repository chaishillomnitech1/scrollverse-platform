# Agent 25 + AURELLION — isolated GitHub retrieval staging

## Purpose

This integration preserves the existing Agent 25 visitor chat and adds optional, read-only evidence retrieval from AURELLION's public GitHub materials. AURELLION remains an independent additive intelligence profile; Agent 25 remains the visitor-facing coordinator.

## Staging-only activation gate

All three values must be present on the isolated Vercel Preview project:

- `AGENT25_AURELLION_GITHUB_ENABLED=true`
- `AGENT25_AURELLION_GITHUB_STAGE=staging`
- Vercel's built-in `VERCEL_ENV=preview`

The code fails closed unless all three checks pass. A production deployment (`VERCEL_ENV=production`) cannot activate retrieval, even if the two custom variables are accidentally copied there. Do not add these variables to Production. The feature is disabled by default.

## Retrieval boundary

- GitHub requests use HTTPS and GET only.
- Only the public repository `chaishillomnitech1/scrollverse-ai-legion` is queried.
- Only five exact paths are allowlisted in `server/agent25.aurellion.ts`.
- Only the `main` ref is used.
- No private repositories, arbitrary user-supplied repository names, branches, paths, GitHub search endpoint, or write endpoints are accepted.
- File size is capped at 80 KiB each and 240 KiB total.
- Retrieved documents are cached in process memory for five minutes.
- Retrieval is only attempted for GitHub, repository, AURELLION, Agent 25, code, architecture, implementation, and public-artifact questions.
- Retrieval failures are non-fatal; Agent 25 continues without GitHub evidence.
- Returned citations include the source path, line range, Git blob SHA, and SHA-256 digest.

The GitHub API is accessed without a credential because all sources are public. No GitHub token is requested, stored, or exposed.

## Prompt-injection boundary

Retrieved text is passed as untrusted reference material. The system instructions explicitly prohibit following instructions contained in repository excerpts. Visitors cannot select a repository, branch, file path, token, or retrieval URL.

## Existing visitor experience

The existing chat widget, site IDs, role selector, provider boundary, origin checks, trusted-proxy controls, and shared Redis rate limiter are retained. The response adds a short public-source citation list only when evidence was retrieved.

## Validation and release gates

1. Run `pnpm check`, `pnpm test`, and `pnpm build` in CI.
2. Review the actual CI logs and resolve every failure.
3. Configure the two custom variables only in the isolated Preview project.
4. Verify `VERCEL_ENV=preview` on the staging deployment.
5. Test disabled-by-default behavior, production fail-closed behavior, exact path restrictions, cache expiry, API failure fallback, and citations.
6. Validate the visitor experience on the staging domain and approved embed origin.
7. Obtain separate approval before any production activation.

This PR creates code and documentation only. It does not create or modify Vercel projects, secrets, billing, DNS, domains, GitHub permissions, production variables, production deployments, or the live visitor experience. A merged PR is not evidence that staging is deployed or active.
