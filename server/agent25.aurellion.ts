import { createHash } from "node:crypto";

const REPOSITORY = "chaishillomnitech1/scrollverse-ai-legion";
const REF = "main";
const MAX_FILE_BYTES = 80 * 1024;
const MAX_TOTAL_BYTES = 240 * 1024;
const CACHE_TTL_MS = 5 * 60 * 1000;
const MAX_RESULTS = 3;
const MAX_EXCERPT_CHARS = 700;

// Exact public files only. This is intentionally narrower than the Legion-wide
// discovery manifest: the first visitor integration exposes AURELLION's own
// public charter, capability, architecture, implementation, and visitor docs.
const ALLOWED_PATHS = [
  "agents/aurellion/README.md",
  "agents/aurellion/CAPABILITY_MATRIX.md",
  "agents/aurellion/visitor/README.md",
  "docs/aurellion/ARCHITECTURE.md",
  "docs/aurellion/IMPLEMENTATION-STATUS.md",
] as const;

export type AurellionEvidenceSource = {
  title: string;
  path: string;
  url: string;
  gitBlobSha: string;
  sha256: string;
  lineStart: number;
  lineEnd: number;
  excerpt: string;
};

type PublicDocument = {
  path: string;
  content: string;
  gitBlobSha: string;
  sha256: string;
  url: string;
};

type RuntimeEnv = Record<string, string | undefined>;

let cachedAt = 0;
let cachedDocuments: PublicDocument[] = [];
let pendingLoad: Promise<PublicDocument[]> | null = null;

export function isAurellionStagingEnabled(env: RuntimeEnv = process.env): boolean {
  // This must be set by the isolated runtime's trusted deployment configuration.
  // Missing, production, or unknown deployment identity always disables retrieval.
  if (env.AGENT25_DEPLOYMENT_ENV !== "staging") return false;
  if (env.VERCEL_ENV === "production") return false;

  return env.AGENT25_AURELLION_GITHUB_ENABLED === "true"
    && env.AGENT25_AURELLION_GITHUB_STAGE === "staging";
}

export function isGitHubEvidenceQuestion(query: string): boolean {
  return /\b(github|repository|repositories|repo|commit|branch|pull request|\bpr\b|aurellion|agent\s*25|codebase|source code|implementation|architecture|public artifact)\b/i.test(query);
}

function decodeGitHubContent(value: string): string {
  return Buffer.from(value.replace(/\s/g, ""), "base64").toString("utf8");
}

async function loadPublicDocuments(): Promise<PublicDocument[]> {
  const now = Date.now();
  if (cachedDocuments.length > 0 && now - cachedAt < CACHE_TTL_MS) return cachedDocuments;
  if (pendingLoad) return pendingLoad;

  const loadPromise: Promise<PublicDocument[]> = (async (): Promise<PublicDocument[]> => {
    const results = await Promise.all(ALLOWED_PATHS.map(async (path): Promise<PublicDocument | null> => {
      const url = `https://api.github.com/repos/${REPOSITORY}/contents/${path}?ref=${REF}`;
      try {
        const response = await fetch(url, {
          method: "GET",
          headers: {
            Accept: "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "ScrollVerse-Agent25-AURELLION-ReadOnly",
          },
          signal: AbortSignal.timeout(4_000),
          cache: "no-store",
        });
        if (!response.ok) return null;
        const payload = await response.json() as {
          type?: string; encoding?: string; content?: string; size?: number;
          sha?: string; html_url?: string;
        };
        if (payload.type !== "file" || payload.encoding !== "base64"
          || typeof payload.content !== "string" || typeof payload.sha !== "string"
          || typeof payload.size !== "number" || payload.size > MAX_FILE_BYTES) return null;
        const content = decodeGitHubContent(payload.content);
        const bytes = Buffer.byteLength(content, "utf8");
        if (bytes > MAX_FILE_BYTES || !content.trim()) return null;
        return {
          path,
          content,
          gitBlobSha: payload.sha,
          sha256: createHash("sha256").update(content, "utf8").digest("hex"),
          url: typeof payload.html_url === "string"
            ? payload.html_url
            : `https://github.com/${REPOSITORY}/blob/${REF}/${path}`,
        } satisfies PublicDocument;
      } catch {
        return null;
      }
    }));

    const documents = results.filter((item): item is PublicDocument => item !== null);
    const totalBytes = documents.reduce((sum, item) => sum + Buffer.byteLength(item.content, "utf8"), 0);
    if (totalBytes > MAX_TOTAL_BYTES) return [];
    if (documents.length > 0) {
      cachedDocuments = documents;
      cachedAt = Date.now();
    }
    return documents;
  })();
  pendingLoad = loadPromise;

  try {
    return await loadPromise;
  } finally {
    if (pendingLoad === loadPromise) pendingLoad = null;
  }
}

function termsFor(query: string): string[] {
  const ignored = new Set(["the", "and", "for", "with", "from", "that", "this", "what", "how", "does", "are", "you", "about", "into", "have", "can", "will"]);
  return Array.from(new Set((query.toLowerCase().match(/[a-z0-9_-]{3,}/g) ?? []).filter((term) => !ignored.has(term)))).slice(0, 24);
}

function buildBoundedExcerpt(lines: string[], start: number, end: number): { excerpt: string; lineEnd: number } {
  const included: string[] = [];
  let chars = 0;
  let lineEnd = start;

  for (let index = start; index < end; index += 1) {
    const separatorLength = included.length > 0 ? 1 : 0;
    const remaining = MAX_EXCERPT_CHARS - chars - separatorLength;
    if (remaining <= 0) break;

    const line = lines[index];
    if (line.length > remaining) {
      included.push(line.slice(0, remaining));
      lineEnd = index + 1;
      break;
    }

    included.push(line);
    chars += separatorLength + line.length;
    lineEnd = index + 1;
    if (chars >= MAX_EXCERPT_CHARS) break;
  }

  return { excerpt: included.join("\n"), lineEnd };
}

export function rankAurellionEvidence(
  query: string,
  documents: PublicDocument[],
): AurellionEvidenceSource[] {
  const terms = termsFor(query);
  if (terms.length === 0) return [];
  const hits: Array<AurellionEvidenceSource & { score: number }> = [];

  for (const document of documents) {
    const lines = document.content.split(/\r?\n/);
    for (let start = 0; start < lines.length; start += 24) {
      const end = Math.min(start + 24, lines.length);
      const fullWindow = lines.slice(start, end).join("\n");
      const normalized = fullWindow.toLowerCase();
      const score = terms.reduce((total, term) => total + (normalized.includes(term) ? 1 : 0), 0);
      if (score === 0) continue;
      const bounded = buildBoundedExcerpt(lines, start, end);
      hits.push({
        title: document.path.split("/").pop() ?? document.path,
        path: document.path,
        url: document.url,
        gitBlobSha: document.gitBlobSha,
        sha256: document.sha256,
        lineStart: start + 1,
        lineEnd: bounded.lineEnd,
        excerpt: bounded.excerpt,
        score,
      });
    }
  }

  hits.sort((a, b) => b.score - a.score || a.path.localeCompare(b.path) || a.lineStart - b.lineStart);
  const selected: AurellionEvidenceSource[] = [];
  const seenPaths = new Set<string>();
  for (const hit of hits) {
    if (seenPaths.has(hit.path)) continue;
    seenPaths.add(hit.path);
    const { score: _score, ...source } = hit;
    selected.push(source);
    if (selected.length >= MAX_RESULTS) break;
  }
  return selected;
}

/** Public-only, exact-path, GET-only evidence retrieval. Disabled unless the trusted runtime is explicitly staging. */
export async function getAurellionGithubEvidence(query: string): Promise<AurellionEvidenceSource[]> {
  if (!isAurellionStagingEnabled() || !isGitHubEvidenceQuestion(query)) return [];
  try {
    const documents = await loadPublicDocuments();
    return rankAurellionEvidence(query, documents);
  } catch {
    // Retrieval is an optional context source; it must never take down Agent 25 chat.
    return [];
  }
}

export function clearAurellionGithubCacheForTests(): void {
  cachedAt = 0;
  cachedDocuments = [];
  pendingLoad = null;
}
