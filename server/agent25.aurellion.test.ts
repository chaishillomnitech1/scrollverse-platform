import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearAurellionGithubCacheForTests,
  getAurellionGithubEvidence,
  isAurellionStagingEnabled,
  isGitHubEvidenceQuestion,
} from "./agent25.aurellion";

describe("Agent 25 AURELLION GitHub staging boundary", () => {
  beforeEach(() => {
    clearAurellionGithubCacheForTests();
    vi.stubEnv("AGENT25_AURELLION_GITHUB_ENABLED", "true");
    vi.stubEnv("AGENT25_AURELLION_GITHUB_STAGE", "staging");
    vi.stubEnv("VERCEL_ENV", "preview");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    clearAurellionGithubCacheForTests();
  });

  it("enables retrieval only for explicitly enabled Preview staging", () => {
    expect(isAurellionStagingEnabled({
      AGENT25_AURELLION_GITHUB_ENABLED: "true",
      AGENT25_AURELLION_GITHUB_STAGE: "staging",
      VERCEL_ENV: "preview",
    })).toBe(true);
    expect(isAurellionStagingEnabled({
      AGENT25_AURELLION_GITHUB_ENABLED: "true",
      AGENT25_AURELLION_GITHUB_STAGE: "staging",
      VERCEL_ENV: "production",
    })).toBe(false);
    expect(isAurellionStagingEnabled({
      AGENT25_AURELLION_GITHUB_ENABLED: "false",
      AGENT25_AURELLION_GITHUB_STAGE: "staging",
      VERCEL_ENV: "preview",
    })).toBe(false);
  });

  it("recognizes repository and AURELLION evidence questions", () => {
    expect(isGitHubEvidenceQuestion("Show the AURELLION implementation status")).toBe(true);
    expect(isGitHubEvidenceQuestion("What is the weather today?")).toBe(false);
  });

  it("returns no evidence and makes no network request outside staging", async () => {
    vi.stubEnv("VERCEL_ENV", "production");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    await expect(getAurellionGithubEvidence("AURELLION GitHub repository")).resolves.toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("fetches only allowlisted public files with GET and returns hash-linked citations", async () => {
    const body = Buffer.from("# AURELLION\nRead-only public GitHub retrieval and provenance.").toString("base64");
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      expect(String(input)).toContain("api.github.com/repos/chaishillomnitech1/scrollverse-ai-legion/contents/");
      expect(String(input)).toContain("?ref=main");
      expect(init?.method).toBe("GET");
      return new Response(JSON.stringify({
        type: "file",
        encoding: "base64",
        content: body,
        size: Buffer.from(body, "base64").length,
        sha: "0123456789abcdef",
        html_url: "https://github.com/chaishillomnitech1/scrollverse-ai-legion/blob/main/agents/aurellion/README.md",
      }), { status: 200, headers: { "content-type": "application/json" } });
    });
    vi.stubGlobal("fetch", fetchMock);

    const sources = await getAurellionGithubEvidence("AURELLION GitHub retrieval provenance");
    expect(sources.length).toBeGreaterThan(0);
    expect(sources[0].gitBlobSha).toBe("0123456789abcdef");
    expect(sources[0].sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(sources[0].url).toContain("github.com/chaishillomnitech1/scrollverse-ai-legion");
    expect(fetchMock).toHaveBeenCalledTimes(5);
  });
});
