import type { Request, Response, NextFunction } from "express";

const VALID_SITE_IDS = new Set(["scrollverse", "scrollatlas", "omnitech1", "generic"]);

function parseConfiguredOrigins(): Map<string, Set<string>> {
  const mapping = new Map<string, Set<string>>();
  const raw = process.env.AGENT25_ALLOWED_EMBED_ORIGINS ?? "";
  for (const entry of raw.split(",")) {
    const separator = entry.indexOf("=");
    if (separator <= 0) continue;
    const siteId = entry.slice(0, separator).trim();
    const candidate = entry.slice(separator + 1).trim();
    if (!VALID_SITE_IDS.has(siteId)) continue;
    try {
      const url = new URL(candidate);
      if (url.protocol !== "https:" || url.origin !== candidate.replace(/\/$/, "") || url.username || url.password) continue;
      const origins = mapping.get(siteId) ?? new Set<string>();
      origins.add(url.origin);
      mapping.set(siteId, origins);
    } catch {
      // Ignore malformed entries; an empty allowlist fails closed.
    }
  }
  return mapping;
}

/** Enforce an exact parent origin for the selected embed site and emit CSP frame-ancestors. */
export function agent25EmbedOriginGuard(req: Request, res: Response, next: NextFunction): void {
  res.vary("Referer");
  const mapping = parseConfiguredOrigins();
  const allOrigins = new Set<string>();
  for (const origins of mapping.values()) for (const origin of origins) allOrigins.add(origin);

  if (process.env.NODE_ENV === "production" && allOrigins.size === 0) {
    res.status(503).send("Agent 25 embed is not configured.");
    return;
  }

  const siteId = typeof req.query.siteId === "string" ? req.query.siteId : "generic";
  if (!VALID_SITE_IDS.has(siteId)) {
    res.status(400).send("Invalid Agent 25 site identifier.");
    return;
  }

  const referer = req.get("referer");
  if (referer) {
    let parentOrigin: string;
    try {
      parentOrigin = new URL(referer).origin;
    } catch {
      res.status(403).send("Embedding origin is not approved.");
      return;
    }
    const siteOrigins = mapping.get(siteId) ?? new Set<string>();
    if (!siteOrigins.has(parentOrigin)) {
      res.status(403).send("Embedding origin is not approved for this site.");
      return;
    }
  } else if (process.env.NODE_ENV === "production") {
    res.status(403).send("A verified embedding origin is required.");
    return;
  }

  const ancestors = ["'self'", ...allOrigins].join(" ");
  res.setHeader("Content-Security-Policy", "frame-ancestors " + ancestors + ";");
  next();
}
