import { describe, expect, it } from "vitest";
import { AGENT25_AGENTS, selectAgent } from "../shared/agent25";
import { formatMethodigitologyContext, methodigitologyIntentSchema } from "../shared/methodigitology";

const validIntent = {
  languageVersion: "1.0.0-draft" as const,
  source: { expression: "PRESERVE THE ORIGINAL", origin: "human", preserveVerbatim: true as const },
  intention: "Preserve the original source",
  purpose: { statement: "Protect provenance", beneficiary: "archive users", harmBoundary: "Do not mutate originals" },
  conviction: { level: "HIGH" as const, statement: "Strong commitment" },
  impact: { class: "DRAFT" as const, rationale: "Blueprint only" },
  constraints: ["No production writes"],
  execution: { mode: "BLUEPRINT" as const },
};

describe("Agent 25 Omni registry", () => {
  it("defines 25 distinct specialist roles", () => {
    expect(AGENT25_AGENTS).toHaveLength(25);
    expect(new Set(AGENT25_AGENTS.map((agent) => agent.id)).size).toBe(25);
  });
  it("routes GitHub questions to GitHub Intelligence", () => {
    expect(selectAgent("Can you inspect my GitHub repository?").id).toBe("10");
  });
  it("routes archive questions to Digital Archive", () => {
    expect(selectAgent("Help me preserve this artifact in the archive").id).toBe("06");
  });
  it("routes general mission questions to Omni Intelligence", () => {
    expect(selectAgent("Give me the big picture of all choices").id).toBe("25");
  });
});

describe("Agent 25 Methodigitology envelope", () => {
  it("accepts a valid four-field intent without granting execution rights", () => {
    expect(methodigitologyIntentSchema.safeParse(validIntent).success).toBe(true);
    expect(formatMethodigitologyContext(validIntent)).toContain("do not authorize execution");
  });
  it("rejects altered or missing verbatim preservation", () => {
    expect(methodigitologyIntentSchema.safeParse({
      ...validIntent, source: { ...validIntent.source, preserveVerbatim: false },
    }).success).toBe(false);
  });
  it("keeps conviction distinct from authorization", () => {
    const parsed = methodigitologyIntentSchema.parse(validIntent);
    expect(parsed.conviction.level).toBe("HIGH");
    expect("authorization" in parsed).toBe(false);
  });
});
