# Agent 25 — staging visitor acceptance and security checklist

Status: **PRE-DEPLOYMENT / NOT RUN**  
Scope: isolated Vercel Preview deployment only. This checklist is not evidence of a live deployment.

## 1. Deployment and environment isolation

- [ ] Vercel account can create resources; no account-level suspension or resource-creation block remains.
- [ ] Create a separate Vercel project named `agent25-staging`, linked to `chaishillomnitech1/scrollverse-platform`.
- [ ] Use Preview deployments only for the pilot. Do not attach the ScrollVerse production domain.
- [ ] Confirm no production domain alias, production environment variable, production database, or production integration is attached.
- [ ] Configure all Agent 25 secrets in Vercel's encrypted **Preview** environment only.
- [ ] Use a dedicated staging Upstash Redis database; do not reuse production Redis.
- [ ] Record the deployment URL, commit SHA, project ID, and test timestamp in the release record. Do not record secret values.

## 2. Required Preview environment variables

| Variable | Expected configuration | Gate |
|---|---|---|
| `AGENT25_API_URL` | `https://api.openai.com/v1/chat/completions` | HTTPS endpoint |
| `AGENT25_ALLOWED_PROVIDER_HOSTS` | `api.openai.com` | Exact hostname |
| `AGENT25_API_KEY` | OpenAI API key entered directly into Vercel | Secret; never log or commit |
| `AGENT25_MODEL` | Exact model identifier enabled for the API account | Confirm API availability |
| `UPSTASH_REDIS_REST_URL` | Dedicated staging database HTTPS REST URL | Secret/config |
| `UPSTASH_REDIS_REST_TOKEN` | Dedicated staging token | Secret |
| `AGENT25_ALLOWED_EMBED_ORIGINS` | Exact `siteId=https://origin` pairs | Verify ownership and exact origins first |
| `AGENT25_TRUST_PROXY_HOPS` | Integer 1–3, based on observed Vercel ingress | Do not guess |

Do not paste credentials into chat, commit them, add them to client-side variables, or include them in screenshots. A ChatGPT subscription does not imply OpenAI API credits.

## 3. Visitor experience acceptance

- [ ] Widget loads on the isolated staging URL without console errors.
- [ ] Welcome state explains that this is a public informational pilot.
- [ ] Visitor can send a normal question and receive a response.
- [ ] Loading, empty input, network failure, provider timeout, and retry states are understandable.
- [ ] Keyboard-only use works; focus is visible and controls have accessible names.
- [ ] Mobile layout works at narrow viewport widths; no clipped composer or unreadable text.
- [ ] Long conversation / oversized message is rejected with a helpful message.
- [ ] Refresh starts a new stateless session; no conversation persistence is implied.
- [ ] UI does not imply that 25 independent agents are running. Agent 00 routes a turn to one specialist role.

## 4. Origin and iframe isolation

Test each approved site ID separately after origins are verified.

- [ ] Approved HTTPS Referer for the matching site ID is accepted.
- [ ] Unapproved hostname is rejected.
- [ ] Same hostname on a different port is rejected.
- [ ] HTTP origin is rejected.
- [ ] A valid origin registered to a different site ID is rejected.
- [ ] Missing Referer is rejected in production mode.
- [ ] Malformed Referer is rejected.
- [ ] Unknown site ID is rejected.
- [ ] Response CSP `frame-ancestors` contains only `'self'` and the exact origins configured for that site ID.
- [ ] No wildcard subdomains or cross-site combined origin list is emitted.
- [ ] Confirm actual browser iframe behavior with the real embed script and parent page.

Note: Referer-based validation can be affected by parent-page Referrer-Policy. Verify the real browser request. Do not weaken the production fail-closed behavior to make a test pass; resolve the parent-page policy or choose a reviewed alternative.

## 5. API abuse, availability, and provider boundary

- [ ] Ten requests from one client IP in a 60-second window are accepted; the next request is rate-limited.
- [ ] Rate limit is shared across at least two independent app instances.
- [ ] A missing Redis URL/token in production fails closed.
- [ ] Redis timeout, non-2xx response, malformed JSON, and Redis error response fail closed with a generic visitor-safe message.
- [ ] A different client IP has an independent counter.
- [ ] Missing/invalid trusted-proxy configuration prevents production chat requests.
- [ ] Verify Vercel ingress hop count using a real staging request before setting the value.
- [ ] Provider endpoint with a non-allowlisted hostname, HTTP scheme, non-default port, credentials, or URL fragment is rejected.
- [ ] Provider timeout and non-2xx response return generic errors; provider response bodies are not exposed.
- [ ] Oversized provider response (including chunked response without Content-Length) is rejected.
- [ ] Request schema limits remain enforced: 10 messages, 2,000 chars/message, 10,000 aggregate chars.
- [ ] Verify no API key, Redis token, raw provider error, or sensitive request data appears in browser network responses or logs.

## 6. Read-only and data isolation

- [ ] Visitor can access only public informational content supplied to Agent 25.
- [ ] No private GitHub repositories, private conversations, unpublished archive, user account, wallet, payment, or credential access is available.
- [ ] No tools, function calls, transactions, publishing, deployment, or other visitor-triggered actions are exposed.
- [ ] Prompt-injection attempts to reveal system instructions or secrets are refused.
- [ ] Financial, legal, medical, and investment advice boundaries are respected.
- [ ] No visitor content is persisted by this pilot; confirm through code and runtime observation.

## 7. Release decision

- [ ] CI typecheck passes.
- [ ] CI unit tests pass.
- [ ] CI production build passes.
- [ ] All staging checks above pass with evidence attached.
- [ ] A human reviewer signs off on the staging report.
- [ ] Production remains disabled. Any future production rollout requires a separate, explicit approval and a separate release plan.

## Evidence record

- Staging URL:
- Project:
- Commit SHA:
- CI run:
- Test date/time (UTC):
- Tester:
- Failed checks / remediation:
- Final decision: **NOT RUN / PASS / BLOCKED**

Never mark a check PASS without observing it. Code-level CI success is not runtime staging acceptance.
