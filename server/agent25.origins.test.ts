import type { NextFunction, Request, Response } from "express";
import { afterEach, describe, expect, it, vi } from "vitest";
import { agent25EmbedOriginGuard } from "./agent25.origins";

function invoke(siteId: string, referer?: string) {
  vi.stubEnv("NODE_ENV", "production");
  vi.stubEnv(
    "AGENT25_ALLOWED_EMBED_ORIGINS",
    "scrollverse=https://scrollverse.co,scrollatlas=https://atlas.example,omnitech1=https://portal.example",
  );
  const req = {
    query: { siteId },
    get: (header: string) => header.toLowerCase() === "referer" ? referer : undefined,
  } as unknown as Request;
  const headers = new Map<string, string>();
  const res = {
    vary: vi.fn(),
    status: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
    setHeader: vi.fn((name: string, value: string) => headers.set(name, value)),
  } as unknown as Response;
  const next = vi.fn() as unknown as NextFunction;
  agent25EmbedOriginGuard(req, res, next);
  return { res, next, headers };
}

afterEach(() => vi.unstubAllEnvs());

describe("Agent 25 exact embed origin policy", () => {
  it("allows a matching site origin and scopes frame ancestors to that site", () => {
    const { next, headers } = invoke("scrollverse", "https://scrollverse.co/page");
    expect(next).toHaveBeenCalledOnce();
    expect(headers.get("Content-Security-Policy")).toBe("frame-ancestors 'self' https://scrollverse.co;");
  });

  it("rejects an origin approved for a different site", () => {
    const { res, next } = invoke("scrollverse", "https://atlas.example/");
    expect(next).not.toHaveBeenCalled();
    expect((res.status as ReturnType<typeof vi.fn>)).toHaveBeenCalledWith(403);
  });

  it("rejects missing Referer in production", () => {
    const { res, next } = invoke("scrollverse");
    expect(next).not.toHaveBeenCalled();
    expect((res.status as ReturnType<typeof vi.fn>)).toHaveBeenCalledWith(403);
  });

  it("rejects unknown site identifiers", () => {
    const { res, next } = invoke("unknown", "https://scrollverse.co/");
    expect(next).not.toHaveBeenCalled();
    expect((res.status as ReturnType<typeof vi.fn>)).toHaveBeenCalledWith(400);
  });
});
