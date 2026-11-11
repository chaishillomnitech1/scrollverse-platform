import { describe, expect, it } from "vitest";
import {
  extractProviderReply,
  MAX_PROVIDER_RESPONSE_BYTES,
  readBoundedProviderBody,
  validateProviderEndpoint,
} from "./agent25.security";

describe("Agent 25 provider boundary", () => {
  it("requires exact allowlisted HTTPS hosts in production", () => {
    expect(validateProviderEndpoint("https://api.example.com/v1/chat/completions", ["api.example.com"], true))
      .toBe("https://api.example.com/v1/chat/completions");
    expect(validateProviderEndpoint("https://attacker.example/v1/chat/completions", ["api.example.com"], true)).toBeNull();
    expect(validateProviderEndpoint("http://api.example.com", ["api.example.com"], true)).toBeNull();
    expect(validateProviderEndpoint("https://api.example.com:8443/v1", ["api.example.com"], true)).toBeNull();
  });

  it("rejects credentials and fragments in provider URLs", () => {
    expect(validateProviderEndpoint("https://user:pass@api.example.com/path", ["api.example.com"], true)).toBeNull();
    expect(validateProviderEndpoint("https://api.example.com/path#fragment", ["api.example.com"], true)).toBeNull();
  });

  it("allows localhost HTTP only outside production", () => {
    expect(validateProviderEndpoint("http://localhost:8080/v1", [], false)).toBe("http://localhost:8080/v1");
    expect(validateProviderEndpoint("http://localhost:8080/v1", ["localhost"], true)).toBeNull();
  });

  it("extracts a valid bounded provider reply", () => {
    expect(extractProviderReply(JSON.stringify({ choices: [{ message: { content: "  Hello  " } }] }))).toBe("Hello");
  });

  it("rejects malformed, missing, and oversized provider payloads", () => {
    expect(extractProviderReply("{")).toBeNull();
    expect(extractProviderReply(JSON.stringify({ choices: [] }))).toBeNull();
    expect(extractProviderReply(JSON.stringify({ choices: [{ message: { content: "x".repeat(8_001) } }] }))).toBeNull();
    expect(extractProviderReply(" ".repeat(MAX_PROVIDER_RESPONSE_BYTES + 1))).toBeNull();
  });

  it("reads a valid response stream", async () => {
    const response = new Response(JSON.stringify({ ok: true }));
    await expect(readBoundedProviderBody(response)).resolves.toBe('{"ok":true}');
  });

  it("rejects a response stream over the hard byte ceiling", async () => {
    const response = new Response("x".repeat(MAX_PROVIDER_RESPONSE_BYTES + 1));
    await expect(readBoundedProviderBody(response)).resolves.toBeNull();
  });
});
