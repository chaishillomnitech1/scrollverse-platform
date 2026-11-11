import { describe, expect, it } from "vitest";
import { AGENT25_AGENTS, selectAgent } from "../shared/agent25";

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
