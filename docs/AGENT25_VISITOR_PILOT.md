# Agent 25 Visitor Pilot — Deployment and Safety Checklist

## What the pilot contains
- A 25-role specialist registry with Agent 00 routing each turn to one selected specialist.
- A public, stateless visitor chat endpoint.
- A floating visitor chat widget and an embeddable iframe launcher at `client/public/agent25-embed.js`.
- Provider-boundary tests and visitor API validation.

## Provider isolation
The visitor runtime uses only these server-side settings:
- `AGENT25_API_URL`
- `AGENT25_API_KEY`
- `AGENT25_MODEL`
- `AGENT25_ALLOWED_PROVIDER_HOSTS` (required in production)

It does not call `invokeLLM`, does not read `BUILT_IN_FORGE_API_KEY`, and does not fall back to the Manus Forge endpoint. If the provider settings are absent, chat returns a safe not-configured response. No secret belongs in GitHub or browser code.

## Visitor safety and limits
- Stateless chat; this pilot does not persist visitor conversations.
- Maximum 10 messages per request, 2,000 characters per message, and 10,000 aggregate message characters.
- Shared Upstash Redis rate limit: 10 requests per client IP per 60 seconds.
- Development may use a bounded in-memory fallback; production fails closed if shared Redis is missing or unavailable.
- Provider timeout: 20 seconds; provider response ceiling: 64 KiB; extracted reply ceiling: 8,000 characters.
- No tools or visitor-triggered actions.
- No private repository, archive, wallet, payment, or account access.
- No financial, legal, medical, or investment advice.

## Staging setup
1. Use a separate Vercel project named `agent25-staging`, linked to this repository.
2. Configure secrets only in the Vercel Preview environment. Use a dedicated staging Redis database.
3. Verify provider hostname allowlist and exact site-to-origin mapping.
4. Observe a real staging request to determine the Vercel proxy-hop count; do not guess.
5. Run the complete [staging configuration](./AGENT25_STAGING_CONFIGURATION.md) and [visitor acceptance/security checklist](./AGENT25_STAGING_ACCEPTANCE.md).
6. Obtain a human staging sign-off before any discussion of production.

## Cross-site embed
Use the script only after a staging host exists and the iframe policy has been verified:

```html
<script src="https://YOUR-STAGING-HOST/agent25-embed.js" data-site-id="scrollverse" defer></script>
```

Valid site IDs: `scrollverse`, `scrollatlas`, `omnitech1`, `generic`. Every site ID must have its own reviewed exact origin mapping. Do not use wildcard origins.

## Honest activation states
- **Manifest-defined:** 25 roles exist in source.
- **Pilot-runnable:** endpoint can invoke a configured provider.
- **Staging-active:** deployed to an isolated staging host and visitor acceptance tests pass.
- **Production-active:** separate explicit approval, production release, and live checks completed.

A code merge or passing CI run alone does not make the visitor assistant live.
