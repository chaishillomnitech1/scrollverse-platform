# Agent 25 Visitor API — Security Hardening Notes

This change hardens the public, informational visitor API. It does not activate a provider, deploy the widget, or grant visitor access to private data.

## Required server-side configuration

- `AGENT25_API_URL`: OpenAI-compatible chat-completions endpoint.
- `AGENT25_API_KEY`: provider credential; store only in the hosting platform's secret manager.
- `AGENT25_MODEL`: provider model identifier.
- `AGENT25_ALLOWED_PROVIDER_HOSTS`: comma-separated exact hostnames permitted in production, for example `api.example-provider.com`.

Production requires HTTPS, an exact hostname match, and the default HTTPS port. URL credentials and fragments are rejected. Local HTTP endpoints are permitted only for local development. Do not put secrets in Git, browser code, issue comments, or visitor-facing configuration.

The allowlist is a configuration boundary, not a substitute for outbound network controls. Production hosting should also restrict egress to approved provider destinations and ensure approved hostnames cannot resolve to internal/private services.

## Request and response boundaries

- At most 10 messages per request and 2,000 characters per message.
- At most 10,000 aggregate message characters per request.
- Provider request timeout: 20 seconds.
- Provider response stream hard ceiling: 64 KiB, including responses without a Content-Length header.
- Extracted assistant reply ceiling: 8,000 characters.
- Provider errors and response bodies are not forwarded to visitors.

## Rate limiting and proxy configuration

The current limiter is bounded to 10 requests per client key per minute and caps its in-memory key map at 10,000 entries. It is process-local: it is not a shared quota across instances and resets on restart. Before multi-instance public rollout, replace it with a shared store (for example, Redis or an equivalent platform primitive).

The host must configure trusted proxies deliberately so the server's client IP value cannot be spoofed through arbitrary forwarding headers. Do not trust all proxy hops by default.

## Rollout gates

1. Run typecheck, unit tests, and production build in CI.
2. Review the actual CI logs and resolve every failure.
3. Configure secrets and exact provider hostnames in an isolated staging secret manager.
4. Validate provider egress restrictions, trusted proxy behavior, rate limits across instances, timeout handling, and embed origin policy.
5. Run staging abuse and isolation tests before any public rollout.
6. Obtain explicit production deployment approval separately.

This PR does not change production infrastructure, provider credentials, DNS, Manus sites, wallets, payment rails, contracts, or deployment settings. A code change is not evidence of staging-active or production-active behavior.
