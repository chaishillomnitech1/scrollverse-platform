# Agent 25 + AURELLION — isolated host-neutral staging

## Purpose

This integration preserves the existing Agent 25 visitor chat and adds optional, read-only evidence retrieval from AURELLION's public GitHub materials. AURELLION remains an independent additive intelligence profile; Agent 25 remains the visitor-facing coordinator.

## Host-neutral staging activation gate

The feature is disabled by default. All three application flags must be explicitly configured in the isolated staging runtime:

- `AGENT25_DEPLOYMENT_ENV=staging`
- `AGENT25_AURELLION_GITHUB_ENABLED=true`
- `AGENT25_AURELLION_GITHUB_STAGE=staging`

`AGENT25_DEPLOYMENT_ENV` is the application's host-neutral deployment identity. Set it in the trusted runtime configuration, never from a request header, query parameter, cookie, or visitor-controlled input. A missing or unknown value fails closed. Set it to `production` in production runtimes; production identity cannot enable retrieval. If the Vercel platform marker is present and says `VERCEL_ENV=production`, retrieval is also rejected as a contradictory production signal. No Vercel variable is required for staging on other hosts.

The staging runtime must be isolated from production, with its own application instance, environment configuration, provider credentials, Redis namespace/instance, and approved origin/provider allowlists. Do not copy staging enablement flags or staging secrets into production.

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
- Returned citations include the source path, exact displayed line range, Git blob SHA, and SHA-256 digest. Truncated excerpts report only lines actually present in the excerpt.

The GitHub API is accessed without a credential because all sources are public. No GitHub token is requested, stored, or exposed.

## Prompt-injection boundary

Retrieved excerpts are sent as a separate, explicitly delimited user-role evidence message, never as an assistant-role message. The system instructions identify the excerpts as untrusted quoted data and prohibit following commands, role changes, or requests inside the material. Visitor messages remain separate. Visitors cannot select a repository, branch, file path, token, or retrieval URL.

## Existing visitor experience

The existing chat widget, site IDs, role selector, provider boundary, origin checks, trusted-proxy controls, and shared Redis rate limiter are retained. The response adds a short public-source citation list only when evidence was retrieved.

## Validation and release gates

1. Run `pnpm check`, `pnpm test`, and `pnpm build` in CI.
2. Review the actual CI logs and resolve every failure.
3. Provision a dedicated staging runtime on the selected host; no specific host is required by the application code.
4. Set the three staging application flags only in that isolated runtime.
5. Verify the deployment identity comes from trusted runtime configuration, not visitor input.
6. Test disabled-by-default behavior, missing/unknown environment fail-closed behavior, production rejection, exact path restrictions, cache expiry, API failure fallback, and citations.
7. Validate the visitor experience on the staging domain and approved embed origin.
8. Obtain separate approval before any production activation.

This change implements application-level host-neutral staging gates and documents the isolated-runtime contract. It does not provision infrastructure, enter secrets, configure DNS/domains, deploy, activate staging, or change production. A passing CI run is not evidence that a staging runtime exists or is active.
