export const MAX_PROVIDER_RESPONSE_BYTES = 64 * 1024;
export const MAX_PROVIDER_REPLY_CHARS = 8_000;

/**
 * Production provider endpoints must use HTTPS and an exact hostname allowlist.
 * Local HTTP endpoints are permitted only outside production for local development.
 */
export function validateProviderEndpoint(
  endpoint: string,
  allowedHosts: string[],
  isProduction: boolean,
): string | null {
  let parsed: URL;
  try {
    parsed = new URL(endpoint);
  } catch {
    return null;
  }

  if (parsed.username || parsed.password || parsed.hash) return null;

  const hostname = parsed.hostname.toLowerCase();
  const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";
  if (parsed.protocol !== "https:" && !( !isProduction && isLocalhost && parsed.protocol === "http:")) {
    return null;
  }
  if (isProduction && (isLocalhost || (parsed.port !== "" && parsed.port !== "443"))) return null;

  const allowlist = new Set(allowedHosts.map((host) => host.trim().toLowerCase()).filter(Boolean));
  if (isProduction && !allowlist.has(hostname)) return null;
  if (!isProduction && !isLocalhost && allowedHosts.length > 0 && !allowlist.has(hostname)) return null;

  return parsed.toString();
}

/** Read a response stream with a hard byte ceiling, even if Content-Length is absent. */
export async function readBoundedProviderBody(response: Response): Promise<string | null> {
  if (!response.body) return null;
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > MAX_PROVIDER_RESPONSE_BYTES) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
  } catch {
    return null;
  } finally {
    reader.releaseLock();
  }

  const combined = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    combined.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(combined);
}

/** Parse a bounded OpenAI-compatible response without leaking provider errors. */
export function extractProviderReply(raw: string): string | null {
  if (Buffer.byteLength(raw, "utf8") > MAX_PROVIDER_RESPONSE_BYTES) return null;

  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    return null;
  }

  if (!payload || typeof payload !== "object") return null;
  const choices = (payload as { choices?: unknown }).choices;
  if (!Array.isArray(choices) || choices.length === 0) return null;
  const first = choices[0];
  if (!first || typeof first !== "object") return null;
  const message = (first as { message?: unknown }).message;
  if (!message || typeof message !== "object") return null;
  const content = (message as { content?: unknown }).content;
  if (typeof content !== "string") return null;

  const reply = content.trim();
  if (!reply || reply.length > MAX_PROVIDER_REPLY_CHARS) return null;
  return reply;
}
