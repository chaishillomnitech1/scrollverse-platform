/**
 * Read-only public GitHub retrieval for Agent 25.
 *
 * The visitor controls only a bounded search phrase. Repository names, refs,
 * and file paths are selected from a checked-in public-only allowlist.
 * Private repositories and arbitrary paths/refs are never queried.
 */
import { createHash } from "node:crypto";
import {
  PUBLIC_GITHUB_REPOSITORY_INDEX,
  type PublicGitHubRepository,
} from "./agent25.github-allowlist";

const API_ROOT = "https://api.github.com";
const MAX_SEARCH_RESULTS = 8;
const MAX_SOURCES = 3;
const MAX_README_BYTES = 512_000;
const MAX_CONTEXT_CHARS = 6_000;
const STOP_WORDS = new Set([
  "github", "repository", "repositories", "repo", "repos", "code",
  "source", "readme", "search", "find", "show", "my", "the", "in",
  "for", "about", "public", "please", "can", "you", "what", "where",
]);

export type PublicGitHubSource = {
  repository: string;
  description: string;
  ref: string;
  path: "README.md";
  content: string;
  gitBlobSha: string;
  rawSha256: string;
  url: string;
};

export class GitHubSourceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GitHubSourceError";
  }
}

function headers(token: string): HeadersInit {
  return {
    Authorization: "Bearer " + token,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "AURELLION-Agent25-ReadOnly-Visitor",
  };
}

function searchTerms(query: string): string[] {
  return query
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^a-z0-9_\s-]/g, " ")
    .split(/[\s-]+/)
    .filter((term) => term.length >= 2 && !STOP_WORDS.has(term))
    .slice(0, 8);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

async function fetchAllowlistedReadme(
  repository: PublicGitHubRepository,
  token: string,
  description: string,
): Promise<PublicGitHubSource | null> {
  if (!repository.paths.includes("README.md")) return null;
  const [owner, name] = repository.fullName.split("/");
  if (!owner || !name) return null;

  const url = API_ROOT + "/repos/" + encodeURIComponent(owner) + "/" +
    encodeURIComponent(name) + "/contents/README.md?ref=" +
    encodeURIComponent(repository.defaultBranch);

  let response: Response;
  try {
    response = await fetch(url, {
      method: "GET",
      headers: headers(token),
      signal: AbortSignal.timeout(8_000),
      redirect: "error",
    });
  } catch {
    throw new GitHubSourceError("GitHub source request failed.");
  }
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new GitHubSourceError("GitHub source request returned HTTP " + response.status + ".");
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new GitHubSourceError("GitHub returned invalid source metadata.");
  }
  if (!isRecord(payload) || payload.type !== "file" || payload.encoding !== "base64" ||
      typeof payload.content !== "string" || typeof payload.sha !== "string") {
    throw new GitHubSourceError("GitHub response was not an expected README file.");
  }

  const encoded = payload.content.replace(/\s/g, "");
  if (!encoded || !/^[A-Za-z0-9+/]*={0,2}$/.test(encoded)) {
    throw new GitHubSourceError("GitHub README encoding is invalid.");
  }
  const raw = Buffer.from(encoded, "base64");
  if (raw.byteLength > MAX_README_BYTES) {
    throw new GitHubSourceError("GitHub README exceeds the source size limit.");
  }

  let decoded: string;
  try {
    decoded = new TextDecoder("utf-8", { fatal: true }).decode(raw);
  } catch {
    throw new GitHubSourceError("GitHub README is not valid UTF-8.");
  }

  return {
    repository: repository.fullName,
    description: description.slice(0, 300),
    ref: repository.defaultBranch,
    path: "README.md",
    content: decoded.slice(0, MAX_CONTEXT_CHARS),
    gitBlobSha: payload.sha,
    rawSha256: createHash("sha256").update(raw).digest("hex"),
    url: "https://github.com/" + repository.fullName + "/blob/" +
      encodeURIComponent(repository.defaultBranch) + "/README.md",
  };
}

/**
 * Search only public repositories present in the reviewed AURELLION allowlist,
 * then fetch only their README.md on the allowlisted default branch.
 * Missing credentials disable retrieval without affecting ordinary chat.
 */
export async function searchAllowlistedPublicGitHub(
  query: string,
  token: string | undefined = process.env.AGENT25_GITHUB_READ_TOKEN,
): Promise<PublicGitHubSource[]> {
  if (!token) return [];
  const terms = searchTerms(query);
  if (terms.length === 0) return [];

  const searchUrl = API_ROOT + "/search/repositories?q=" +
    encodeURIComponent("user:chaishillomnitech1 is:public " + terms.join(" ")) +
    "&per_page=" + MAX_SEARCH_RESULTS + "&sort=updated";

  let response: Response;
  try {
    response = await fetch(searchUrl, {
      method: "GET",
      headers: headers(token),
      signal: AbortSignal.timeout(8_000),
      redirect: "error",
    });
  } catch {
    throw new GitHubSourceError("GitHub repository search failed.");
  }
  if (!response.ok) {
    throw new GitHubSourceError("GitHub repository search returned HTTP " + response.status + ".");
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new GitHubSourceError("GitHub repository search returned invalid JSON.");
  }
  if (!isRecord(payload) || !Array.isArray(payload.items)) {
    throw new GitHubSourceError("GitHub repository search response was invalid.");
  }

  const candidates: Array<{ repository: PublicGitHubRepository; description: string }> = [];
  for (const item of payload.items) {
    if (!isRecord(item) || item.private === true || typeof item.full_name !== "string") continue;
    const repository = PUBLIC_GITHUB_REPOSITORY_INDEX.get(item.full_name);
    if (!repository || item.default_branch !== repository.defaultBranch) continue;
    candidates.push({
      repository,
      description: typeof item.description === "string" ? item.description : "",
    });
    if (candidates.length >= MAX_SOURCES) break;
  }

  const sources: PublicGitHubSource[] = [];
  for (const candidate of candidates) {
    const source = await fetchAllowlistedReadme(candidate.repository, token, candidate.description);
    if (source) sources.push(source);
  }
  return sources;
}

export function isGitHubResearchQuestion(message: string): boolean {
  return /\b(github|repositories|repository|repos?|codebase|readme|commit|branch|source files?)\b/i.test(message) ||
    PUBLIC_GITHUB_REPOSITORY_INDEX.has("chaishillomnitech1/" + message.trim());
}

export function formatGitHubSourceContext(sources: PublicGitHubSource[]): string {
  return sources.map((source, index) => [
    "[PUBLIC SOURCE " + (index + 1) + "]",
    "Repository: " + source.repository,
    "Description: " + source.description,
    "Ref: " + source.ref,
    "Path: " + source.path,
    "Git blob SHA: " + source.gitBlobSha,
    "Raw SHA-256: " + source.rawSha256,
    "URL: " + source.url,
    "BEGIN UNTRUSTED REPOSITORY CONTENT",
    source.content,
    "END UNTRUSTED REPOSITORY CONTENT",
  ].join("\n")).join("\n\n");
}

export function formatGitHubSourceLinks(sources: PublicGitHubSource[]): string {
  if (sources.length === 0) return "";
  return "\n\n**Public GitHub sources retrieved:**\n" + sources.map((source) =>
    "- [" + source.repository + " README](" + source.url + ") — ref: " +
    source.ref + "; Git blob: " + source.gitBlobSha + "; SHA-256: " + source.rawSha256
  ).join("\n");
}
