# Agent 25 — isolated Vercel staging configuration

This configuration is for the separate `agent25-staging` project only. Do not copy these values into production or into GitHub.

## OpenAI provider

Store these as server-side Vercel Preview environment variables:

- `AGENT25_API_URL=https://api.openai.com/v1/chat/completions`
- `AGENT25_ALLOWED_PROVIDER_HOSTS=api.openai.com`
- `AGENT25_API_KEY`: create an OpenAI API key in the OpenAI Platform and enter it directly into Vercel's encrypted environment-variable editor. Never paste it into ChatGPT, GitHub, a browser field on the visitor site, or a source file.
- `AGENT25_MODEL`: select a currently supported model in the OpenAI API account and enter its exact model identifier. Do not assume a ChatGPT subscription includes API credits or API access.

## Shared rate limiting

Provision a dedicated Upstash Redis database for staging, then set its HTTPS REST URL and token as Preview-only Vercel secrets:

- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

The server performs an atomic Lua increment/expiry operation. The public endpoint allows 10 requests per IP hash per 60 seconds. If Redis is unavailable, production mode rejects requests rather than silently falling back to per-instance memory.

## Approved embed origins

The following site-to-origin map is the proposed exact allowlist based on the known public site URLs. Verify each site is still controlled by the intended owner before enabling it:

```text
AGENT25_ALLOWED_EMBED_ORIGINS=scrollverse=https://scrollverse.co,scrollatlas=https://scrollatlas-d5ahpowr.manus.space,omnitech1=https://scrollport-xkjtdnvi.manus.space
```

No wildcard subdomains are accepted. The embed request's Referer origin must match the selected site ID. CSP `frame-ancestors` is emitted using only the configured exact origins.

## Trusted proxy

Do not guess the hop count. First inspect a real staging request and confirm the Vercel ingress chain. Then set:

```text
AGENT25_TRUST_PROXY_HOPS=<verified integer from 1 to 3>
```

The Express application trusts only that numeric number of hops. Do not set this to `true`.

## Release gates

1. Vercel account/project creation must be available and the isolated project must be protected.
2. Add the provider key and Redis secrets directly in the Vercel Preview environment.
3. Verify Vercel ingress and set the trusted proxy hop count.
4. Verify all three site origins and each site's matching `siteId`.
5. Test shared rate limits across at least two instances, missing/invalid Referer, wrong-site origin, provider timeout, and provider failure.
6. Confirm the staging deployment and visitor flow before discussing production. Production remains disabled until a separate explicit approval.

No production secrets, domains, DNS, Manus sites, wallets, payments, contracts, or production deployments are changed by this configuration.