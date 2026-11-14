import { describe, expect, it } from "vitest";
import { parseFederationEventV1 } from "./event.v1";

const validEvent = {
  schema_version: "1.0.0",
  event_id: "7a0e1a4a-ef3f-4a32-8c95-62a1d0d8a2e7",
  event_type: "repository.integrity.completed",
  occurred_at: "2026-11-14T16:00:00Z",
  producer: {
    repository: "chaishillomnitech1/scrollverse-platform",
    service: "agent25-integrity",
    specialist_profile: "scrollverse-platform-specialist",
  },
  subject: "repository:scrollverse-platform",
  correlation_id: "4d04d43d-9c70-49a1-9d18-8d3d8d8f15f3",
  classification: "INTERNAL",
  payload: { status: "PASS", files_checked: 12 },
  provenance: {
    source_ref: "server/_core/heartbeat.ts",
    commit_sha: "0123456789abcdef0123456789abcdef01234567",
    content_sha256: "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
  },
  policy: { permitted_actions: ["read", "index"], retention_days: 365 },
};

describe("FederationEventV1Schema", () => {
  it("accepts a valid, provenance-bearing event", () => {
    expect(parseFederationEventV1(validEvent).success).toBe(true);
  });

  it("rejects unsupported major versions and malformed identifiers", () => {
    expect(
      parseFederationEventV1({
        ...validEvent,
        schema_version: "2.0.0",
        event_id: "not-a-uuid",
      }).success,
    ).toBe(false);
  });

  it("rejects unrecognized top-level fields", () => {
    expect(
      parseFederationEventV1({ ...validEvent, private_key: "never-allow-this" }).success,
    ).toBe(false);
  });
});
