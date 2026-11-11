# Agent 25 Visitor API — Security Hardening Notes

This change hardens the public, informational visitor API. It does not activate a provider, deploy the widget, or grant visitor access to private data.

## Required server-side configuration

- `AGENT25_API_URL`: OpenAI-compatible chat-completions endpoint.
- `AGENT25_API_KEY`: provider credential; store only in the hosting platform's secret manager.
- `AGENT25_MODEL`: provider model identifier.
- `AGENT25_ALLOWED_PROVIDER_HOSTS`: comma-separated exact hostnames permitted in production, for example `api.openai.com`.
- `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`: HTTPS REST credentials for the shared Redis rate-limit store.
- `AGENT25_TRUST_PROXY_HOPS`: explicit integer proxy-hop count (1–3); do not set until the actual Vercel request path is verified.
- `AGENT25_ALLOWED_EMBED_ORIGINS`: comma-separated `siteId=https://exact-origin` entries; no wildcards or path prefixes.

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

The visitor API uses an atomic Redis Lua fixed-window counter: 10 requests per client key per 60 seconds. The Redis key hashes the client IP. Development may use a bounded in-memory fallback; production fails closed if Redis is missing or unavailable.

Express trusts only the explicitly configured numeric proxy-hop count. The Agent 25 production route fails closed unless `AGENT25_TRUST_PROXY_HOPS` is a valid integer from 1 to 3. Confirm the actual Vercel ingress chain before setting it; never use `true` or trust arbitrary forwarded headers.

The embed route builds `frame-ancestors` from the exact origins in `AGENT25_ALLOWED_EMBED_ORIGINS`, and checks the request Referer against the selected `siteId`. Missing or unapproved parent origins are rejected in production. `Content-Security-Policy` is the framing control; do not add an `X-Frame-Options: SAMEORIGIN` header because it would block the approved cross-origin embeds.

## Rollout gates

1. Run typecheck, unit tests, and production build in CI.
2. Review the actual CI logs and resolve every failure.
3. Configure secrets and exact provider hostnames in an isolated staging secret manager.
4. Validate provider egress restrictions, trusted proxy behavior, rate limits across instances, timeout handling, and embed origin policy.
5. Run staging abuse and isolation tests before any public rollout.
6. Obtain explicit production deployment approval separately.

This PR does not change production infrastructure, provider credentials, DNS, Manus sites, wallets, payment rails, contracts, or deployment settings. A code change is not evidence of staging-active or production-active behavior.
