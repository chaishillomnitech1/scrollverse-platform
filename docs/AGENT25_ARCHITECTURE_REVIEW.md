# Agent 25 — architecture review and improvement backlog

Review basis: current `main` source and merged Agent 25 changes inspected on 2026-11-11. This is a source review, not a penetration test or live deployment assessment.

## Current architecture

1. The public visitor UI calls a stateless tRPC mutation.
2. The API validates message roles, message count, per-message size, and aggregate size.
3. Agent 00 deterministically selects one specialist role from the 25-role registry.
4. The server builds a read-only system prompt and calls the configured OpenAI-compatible endpoint.
5. Provider endpoint validation, request timeout, response byte ceiling, reply length ceiling, and generic error handling are implemented.
6. A shared Upstash Redis Lua counter enforces 10 requests per client IP hash per 60 seconds. Production fails closed when Redis is unavailable.
7. The embed document is guarded before the Vite/static fallback. Its CSP is scoped to the selected site ID.
8. Production chat requests require an explicit numeric trusted-proxy hop setting.

## Verified strengths

- Provider credentials are read server-side and are not part of the visitor request schema.
- Production provider endpoints require HTTPS and an exact hostname allowlist.
- Provider response streaming is capped even when Content-Length is absent.
- Redis increment and first-request expiry are atomic in one Lua script.
- Production does not silently fall back to per-instance in-memory rate limiting.
- Embed middleware is now mounted on `/agent25/embed`; the prior unmounted middleware issue was corrected in merged PR #5.
- CSP frame ancestors are scoped per site ID rather than combining every site's origins.
- The prompt explicitly denies private data access, tools, visitor-triggered actions, and production writes.

## Improvement items before staging sign-off

### A. Add direct tests for the origin guard

The inspected test files cover provider validation and some router behavior, but a dedicated origin-guard test suite was not present in the inspected server file list. Add tests for valid matching Referer, missing Referer in production, malformed Referer, unknown site ID, wrong site ID, wrong port, HTTP, and site-scoped CSP. Include a test proving middleware is mounted before static fallback.

### B. Add deterministic rate-limit tests

Add tests with mocked Upstash responses for counts 1, 10, and 11; malformed response; Redis error; HTTP failure; timeout; and missing credentials in production. Verify the local development fallback is never used in production. Test two independent application instances against the same mocked/shared store.

### C. Verify client IP trust at the Vercel edge

The router depends on `req.ip`, which is only trustworthy when Express proxy hops are correctly configured. The source correctly avoids `trust proxy = true`, but the actual hop count is an operational fact that cannot be established from source alone. Observe staging requests and validate the forwarded chain before setting `AGENT25_TRUST_PROXY_HOPS`.

### D. Verify embed Referer behavior in real browsers

The guard intentionally fails closed when production Referer is absent. A parent site's Referrer-Policy can suppress or reduce Referer. Test the actual iframe request from each parent page. Do not weaken the guard or broaden CSP as a workaround.

### E. Tighten operational observability without logging secrets

Add structured, privacy-conscious counters for rate-limit rejection, Redis unavailable, origin rejection, provider timeout, and provider response rejection. Never log API keys, Redis tokens, full prompts, raw visitor message content, or provider response bodies. Consider request correlation IDs and short retention.

### F. Confirm network egress controls

An exact provider hostname allowlist validates configuration but is not itself an outbound firewall. Where the hosting plan supports it, restrict outbound network access to the intended provider endpoint and confirm DNS cannot resolve an approved hostname to internal/private address space. If the platform cannot enforce egress policy, record that as a residual risk rather than claiming the hostname allowlist is a network firewall.

### G. Make public pilot disclosure explicit

The widget should state that it is an experimental, stateless, informational assistant; visitors should not submit secrets or sensitive personal data. Ensure the UI communicates that messages are sent to the configured AI provider for response generation.

## No-go conditions

Do not call the pilot staging-active until the Vercel Preview deployment exists and runtime visitor tests pass. Do not enable production. Do not configure production secrets, DNS, domains, provider credentials, databases, wallets, payments, or contracts as part of this work.

## Review outcome

**Source architecture: suitable to proceed to isolated staging after the listed test and configuration gates.**  
**Runtime status: not deployed / not verified.**  
**Next engineering priority: origin-guard and shared-rate-limit test coverage, followed by browser-level staging validation.**
