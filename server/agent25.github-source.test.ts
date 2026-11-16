import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  formatGitHubSourceContext,
  formatGitHubSourceLinks,
  isGitHubResearchQuestion,
  searchAllowlistedPublicGitHub,
} from "./agent25.github-source";

function jsonResponse(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("Agent 25 public GitHub source retrieval", () => {
  beforeEach(() => {
    vi.stubEnv("AGENT25_GITHUB_READ_TOKEN", "read-only-test-token");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("searches only allowlisted public repositories and retrieves the fixed README path", async () => {
    const readme = "# ScrollVerse AI Legion\nPublic AURELLION visitor guide.";
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse({
        items: [
          { full_name: "chaishillomnitech1/scrollverse-ai-legion", private: false, default_branch: "main", description: "AURELLION" },
          { full_name: "chaishillomnitech1/not-in-allowlist", private: false, default_branch: "main", description: "Unapproved" },
          { full_name: "chaishillomnitech1/private-repository", private: true, default_branch: "main", description: "Private" },
        ],
      }))
      .mockResolvedValueOnce(jsonResponse({
        type: "file",
        encoding: "base64",
        content: Buffer.from(readme, "utf8").toString("base64"),
        sha: "git-blob-sha",
      }));
    vi.stubGlobal("fetch", fetchMock);

    const sources = await searchAllowlistedPublicGitHub("AURELLION repository retrieval");
    expect(sources).toHaveLength(1);
    expect(sources[0].repository).toBe("chaishillomnitech1/scrollverse-ai-legion");
    expect(sources[0].content).toContain("Public AURELLION visitor guide");
    expect(sources[0].gitBlobSha).toBe("git-blob-sha");
    expect(sources[0].rawSha256).toMatch(/^[a-f0-9]{64}$/);
    expect(sources[0].url).toBe("https://github.com/chaishillomnitech1/scrollverse-ai-legion/blob/main/README.md");

    const searchUrl = String(fetchMock.mock.calls[0][0]);
    const readmeUrl = String(fetchMock.mock.calls[1][0]);
    expect(searchUrl).toContain("user%3Achaishillomnitech1");
    expect(searchUrl).toContain("is%3Apublic");
    expect(readmeUrl).toContain("/contents/README.md?ref=main");
    expect(readmeUrl).not.toContain("private-repository");
    expect(readmeUrl).not.toContain("not-in-allowlist");

    const context = formatGitHubSourceContext(sources);
    expect(context).toContain("BEGIN UNTRUSTED REPOSITORY CONTENT");
    expect(formatGitHubSourceLinks(sources)).toContain("SHA-256:");
  });

  it("does not make a GitHub request when the read-only token is absent", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const sources = await searchAllowlistedPublicGitHub("AURELLION repository", "");
    expect(sources).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("does not search when the visitor provides no meaningful repository terms", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const sources = await searchAllowlistedPublicGitHub("find my public GitHub repositories");
    expect(sources).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("fails closed on GitHub API errors without exposing credentials", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("secret-bearing upstream body", { status: 503 }));
    vi.stubGlobal("fetch", fetchMock);
    await expect(searchAllowlistedPublicGitHub("AURELLION repository"))
      .rejects.toThrow("GitHub repository search returned HTTP 503.");
  });

  it("recognizes GitHub and repository discovery requests", () => {
    expect(isGitHubResearchQuestion("Search GitHub for the ScrollVerse repository")).toBe(true);
    expect(isGitHubResearchQuestion("Explain the weather")).toBe(false);
  });
});
