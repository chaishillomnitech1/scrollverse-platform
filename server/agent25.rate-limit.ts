import { createHash } from "node:crypto";

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 10;
const LOCAL_MAX_KEYS = 10_000;
const localRequests = new Map<string, number[]>();

const RATE_LIMIT_SCRIPT = [
  "local count = redis.call('INCR', KEYS[1])",
  "if count == 1 then redis.call('PEXPIRE', KEYS[1], ARGV[1]) end",
  "local ttl = redis.call('PTTL', KEYS[1])",
  "return {count, ttl}",
].join("\n");

function enforceLocalRateLimit(key: string): void {
  const now = Date.now();
  for (const [client, timestamps] of localRequests) {
    if (now - (timestamps[timestamps.length - 1] ?? 0) >= WINDOW_MS) {
      localRequests.delete(client);
    }
  }
  if (!localRequests.has(key) && localRequests.size >= LOCAL_MAX_KEYS) {
    const oldest = localRequests.keys().next().value;
    if (oldest) localRequests.delete(oldest);
  }
  const recent = (localRequests.get(key) ?? []).filter((at) => now - at < WINDOW_MS);
  if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
    throw new Error("RATE_LIMITED");
  }
  recent.push(now);
  localRequests.set(key, recent);
}

/**
 * Shared fixed-window limiter using one atomic Redis Lua operation.
 * Production fails closed if the shared store is not configured or unavailable.
 */
export async function enforceAgent25RateLimit(clientIp: string): Promise<void> {
  const isProduction = process.env.NODE_ENV === "production";
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();

  if (!redisUrl || !redisToken) {
    if (isProduction) throw new Error("RATE_LIMIT_STORE_UNAVAILABLE");
    enforceLocalRateLimit(clientIp);
    return;
  }

  let baseUrl: URL;
  try {
    baseUrl = new URL(redisUrl);
  } catch {
    throw new Error("RATE_LIMIT_STORE_UNAVAILABLE");
  }
  if (baseUrl.protocol !== "https:" || baseUrl.username || baseUrl.password) {
    throw new Error("RATE_LIMIT_STORE_UNAVAILABLE");
  }

  const key = "agent25:visitor:" + createHash("sha256").update(clientIp).digest("hex");
  let response: Response;
  try {
    response = await fetch(baseUrl.toString().replace(/\/$/, ""), {
      method: "POST",
      headers: {
        Authorization: "Bearer " + redisToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(["EVAL", RATE_LIMIT_SCRIPT, "1", key, String(WINDOW_MS)]),
      signal: AbortSignal.timeout(2_500),
    });
  } catch {
    throw new Error("RATE_LIMIT_STORE_UNAVAILABLE");
  }
  if (!response.ok) throw new Error("RATE_LIMIT_STORE_UNAVAILABLE");

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new Error("RATE_LIMIT_STORE_UNAVAILABLE");
  }
  if (!payload || typeof payload !== "object" || "error" in payload) {
    throw new Error("RATE_LIMIT_STORE_UNAVAILABLE");
  }
  const result = (payload as { result?: unknown }).result;
  if (!Array.isArray(result) || typeof result[0] !== "number") {
    throw new Error("RATE_LIMIT_STORE_UNAVAILABLE");
  }
  if (result[0] > MAX_REQUESTS_PER_WINDOW) throw new Error("RATE_LIMITED");
}
