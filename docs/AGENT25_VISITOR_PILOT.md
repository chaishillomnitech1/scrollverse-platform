# Agent 25 Visitor Pilot — Deployment and Safety Checklist

## What this branch adds
- A 25-role specialist registry and deterministic role selector.
- A public, stateless visitor chat endpoint.
- A floating visitor chat widget on the ScrollVerse Platform app.
- An embeddable iframe launcher at `client/public/agent25-embed.js`.
- Tests for role count and specialist routing.

## Provider isolation
The visitor runtime uses only these server-side settings:
- `AGENT25_API_URL`
- `AGENT25_API_KEY`
- `AGENT25_MODEL`

It does not call `invokeLLM`, does not read `BUILT_IN_FORGE_API_KEY`, and does not fall back to the Manus Forge endpoint. If the three settings are absent, the chat returns a safe not-configured response. No secret belongs in GitHub or browser code.

## Visitor safety
- Stateless chat: no conversation persistence in this pilot.
- Max 10 messages per request, 2,000 characters per message.
- In-memory limit: 10 requests per IP per minute (single-process pilot only).
- No tools or visitor-triggered actions.
- No private repository, archive, wallet, payment, or account access.
- No financial, legal, or medical advice.
- No production writes, deploys, or publishing.

## Staging setup
1. Merge this PR only after reviewing the diff and running tests.
2. Deploy to an isolated staging project, not the current live Manus site.
3. Configure the three provider environment variables in the staging host's secret manager.
4. Configure the staging host's Content-Security-Policy `frame-ancestors` with exact approved site origins. Do not use a wildcard.
5. Test the widget on one staging page.
6. Confirm rate limiting, error handling, keyboard access, mobile layout, and provider isolation.
7. Expand to other sites only after the site registry and exact embed origins are reviewed.
8. Production deployment requires separate explicit approval.

## Cross-site embed
Use the script tag below only after a staging host exists and iframe policy is configured:

```html
<script src="https://YOUR-STAGING-HOST/agent25-embed.js" data-site-id="scrollverse" defer></script>
```

Valid site IDs: `scrollverse`, `scrollatlas`, `omnitech1`, `generic`.

## Honest activation states
- Manifest-defined: 25 roles exist in source.
- Pilot-runnable: endpoint can invoke a configured provider.
- Staging-active: visitor chat is tested on a staging host.
- Production-active: explicitly approved deployment and live checks completed.

A code branch alone does not make the visitor assistant live.
