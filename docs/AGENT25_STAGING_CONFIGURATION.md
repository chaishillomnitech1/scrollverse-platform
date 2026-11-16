# Agent 25 — isolated Vercel staging configuration

This runbook is for a separate `agent25-staging` Vercel project. The current status is **blocked before project creation** by an account-level Vercel resource-creation restriction. No staging deployment exists. Do not copy any setting into production.

## 1. Vercel project boundary

- Create a separate project named `agent25-staging` linked to `chaishillomnitech1/scrollverse-platform`.
- Keep this pilot on Preview deployments. Do not attach `scrollverse.co` or another production domain.
- Do not attach production databases, production integrations, or production environment variables.
- Do not enable a production deployment as a workaround. Production requires separate explicit approval.

## 2. OpenAI provider

Set these as server-side Vercel **Preview** environment variables:

- `AGENT25_API_URL=https://api.openai.com/v1/chat/completions`
- `AGENT25_ALLOWED_PROVIDER_HOSTS=api.openai.com`
- `AGENT25_API_KEY`: create an API key in the OpenAI Platform and enter it directly into Vercel's encrypted environment-variable editor. Never paste it into ChatGPT, GitHub, browser code, or source files.
- `AGENT25_MODEL`: use the exact model identifier currently enabled for the OpenAI API account. Confirm API access and billing independently; a ChatGPT subscription does not imply API credits.

Do not expose any of these variables with a client-side prefix or include their values in screenshots, logs, commits, or issue comments.

## 3. Shared rate limiting

Provision a dedicated Upstash Redis database for staging. Set the following in Vercel Preview only:

- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

The server uses an atomic Lua increment/expiry operation. The public endpoint allows 10 requests per client IP per 60 seconds. Production fails closed if the shared store is missing or unavailable. Never reuse a production Redis database for staging.

## 4. Approved embed origins

The currently documented mapping is a **proposal only** and must not be enabled until the owner confirms each exact HTTPS origin is still controlled by the intended site:

```text
AGENT25_ALLOWED_EMBED_ORIGINS=scrollverse=https://scrollverse.co,scrollatlas=https://scrollatlas-d5ahpowr.manus.space,omnitech1=https://scrollport-xkjtdnvi.manus.space
```

No wildcard subdomains are accepted. Each `siteId` receives only its own exact origins in CSP `frame-ancestors`. If the site owner cannot verify an origin, omit that site until verified. Do not assume a remembered URL is still authoritative.

## 5. Trusted proxy

Do not guess the hop count. First inspect a real staging request and confirm the Vercel ingress chain. Then set:

```text
AGENT25_TRUST_PROXY_HOPS=<verified integer from 1 to 3>
```

Express trusts only that numeric number of hops. Do not set this to `true`. If the observed ingress cannot be confidently established, keep chat disabled.

## 6. Ordered staging procedure

1. Resolve Vercel account access/resource-creation block through Vercel directly.
2. Create the isolated Preview-only project; confirm no production domain or production environment linkage.
3. Provision dedicated staging Redis and enter Preview secrets.
4. Enter OpenAI endpoint, API key, model, and exact hostname allowlist in Preview secrets.
5. Verify the exact site origins with the site owner; configure only confirmed origins.
6. Deploy a Preview build only.
7. Observe the real ingress chain and set the verified trusted proxy hop count.
8. Run [Agent 25 staging acceptance and security checklist](./AGENT25_STAGING_ACCEPTANCE.md).
9. Record commit SHA, CI run, Preview URL, test evidence, and pass/fail results. Do not record secret values.

## 7. No-production boundary

No production secrets, domains, DNS, Manus sites, wallets, payments, contracts, or production deployments are changed by this runbook. Staging is not considered active until the Preview deployment exists and visitor acceptance tests pass. Production remains disabled unless separately and explicitly approved.
