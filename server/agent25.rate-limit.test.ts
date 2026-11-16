import { afterEach, describe, expect, it, vi } from "vitest";
import { enforceAgent25RateLimit } from "./agent25.rate-limit";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("Agent 25 shared Redis rate limit", () => {
  it("allows ten requests and rejects the eleventh using the shared counter", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://redis.example");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "read-only-test-secret");
    let count = 0;
    const fetchMock = vi.fn(async () => new Response(
      JSON.stringify({ result: [++count, 60_000] }),
      { status: 200, headers: { "content-type": "application/json" } },
    ));
    vi.stubGlobal("fetch", fetchMock);

    for (let index = 0; index < 10; index += 1) {
      await expect(enforceAgent25RateLimit("203.0.113.20")).resolves.toBeUndefined();
    }
    await expect(enforceAgent25RateLimit("203.0.113.20")).rejects.toThrow("RATE_LIMITED");
    expect(fetchMock).toHaveBeenCalledTimes(11);
    expect(JSON.stringify(fetchMock.mock.calls)).not.toContain("203.0.113.20");
  });

  it("fails closed in production when shared Redis is not configured", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    await expect(enforceAgent25RateLimit("203.0.113.21"))
      .rejects.toThrow("RATE_LIMIT_STORE_UNAVAILABLE");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("fails closed when the shared Redis service is unavailable", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://redis.example");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "read-only-test-secret");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("unavailable", { status: 503 })));
    await expect(enforceAgent25RateLimit("203.0.113.22"))
      .rejects.toThrow("RATE_LIMIT_STORE_UNAVAILABLE");
  });
});
