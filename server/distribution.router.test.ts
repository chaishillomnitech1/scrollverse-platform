import { describe, it, expect } from "vitest";
import { distributionRouter } from "./distribution.router";

/**
 * Create a caller for testing the distribution router
 */
async function createDistributionCaller() {
  return distributionRouter.createCaller({});
}

describe("Distribution Router", () => {
  describe("getStats", () => {
    it("should return distribution stats with correct structure", async () => {
      const caller = await createDistributionCaller();
      const stats = await caller.getStats();

      expect(stats).toBeDefined();
      expect(stats.totalAmount).toBe("$4,078,000");
      expect(stats.activeWallets).toBe(12447);
      expect(stats.zakatPercentage).toBe(7.77);
      expect(stats.distributionCycles).toBe(144);
    });

    it("should return sovereign hashtags in stats", async () => {
      const caller = await createDistributionCaller();
      const stats = await caller.getStats();

      expect(stats.sovereignHashtags).toContain("#MRWALKSHIT");
      expect(stats.sovereignHashtags).toContain("#CHAISTHEGREAT");
      expect(stats.sovereignHashtags).toContain("#XLVIIIBLOCKS");
      expect(stats.sovereignHashtags).toHaveLength(3);
    });

    it("should return flow stages with correct structure", async () => {
      const caller = await createDistributionCaller();
      const stats = await caller.getStats();

      expect(stats.flowStages).toHaveLength(4);
      expect(stats.flowStages[0].stage).toBe("Collection");
      expect(stats.flowStages[0].status).toBe("ACTIVE");
    });
  });

  describe("getHashtags", () => {
    it("should return all sovereign hashtags", async () => {
      const caller = await createDistributionCaller();
      const hashtags = await caller.getHashtags();

      expect(hashtags).toEqual([
        "#MRWALKSHIT",
        "#CHAISTHEGREAT",
        "#XLVIIIBLOCKS",
      ]);
    });

    it("should return exactly 3 hashtags", async () => {
      const caller = await createDistributionCaller();
      const hashtags = await caller.getHashtags();

      expect(hashtags).toHaveLength(3);
    });
  });

  describe("validateHashtag", () => {
    it("should validate #MRWALKSHIT as valid", async () => {
      const caller = await createDistributionCaller();
      const result = await caller.validateHashtag({ hashtag: "#MRWALKSHIT" });

      expect(result.isValid).toBe(true);
      expect(result.hashtag).toBe("#MRWALKSHIT");
    });

    it("should validate #CHAISTHEGREAT as valid", async () => {
      const caller = await createDistributionCaller();
      const result = await caller.validateHashtag({ hashtag: "#CHAISTHEGREAT" });

      expect(result.isValid).toBe(true);
    });

    it("should validate #XLVIIIBLOCKS as valid", async () => {
      const caller = await createDistributionCaller();
      const result = await caller.validateHashtag({ hashtag: "#XLVIIIBLOCKS" });

      expect(result.isValid).toBe(true);
    });

    it("should reject invalid hashtags", async () => {
      const caller = await createDistributionCaller();
      const result = await caller.validateHashtag({ hashtag: "#INVALID" });

      expect(result.isValid).toBe(false);
    });
  });

  describe("getZakatFlow", () => {
    it("should return Zakat flow info with correct percentage", async () => {
      const caller = await createDistributionCaller();
      const zakatFlow = await caller.getZakatFlow();

      expect(zakatFlow.percentage).toBe(7.77);
      expect(zakatFlow.isImmutable).toBe(true);
      expect(zakatFlow.description).toContain("immutable");
    });
  });

  describe("getFlowStages", () => {
    it("should return 4 distribution flow stages", async () => {
      const caller = await createDistributionCaller();
      const stages = await caller.getFlowStages();

      expect(stages).toHaveLength(4);
    });

    it("should have correct stage names", async () => {
      const caller = await createDistributionCaller();
      const stages = await caller.getFlowStages();

      expect(stages[0].stage).toBe("Collection");
      expect(stages[1].stage).toBe("Validation");
      expect(stages[2].stage).toBe("Zakat Calculation");
      expect(stages[3].stage).toBe("Distribution");
    });

    it("should have all stages marked as ACTIVE", async () => {
      const caller = await createDistributionCaller();
      const stages = await caller.getFlowStages();

      stages.forEach((stage) => {
        expect(stage.status).toBe("ACTIVE");
      });
    });
  });

  describe("validateContent", () => {
    it("should validate content with all sovereign hashtags", async () => {
      const caller = await createDistributionCaller();
      const content =
        "This is a test #MRWALKSHIT #CHAISTHEGREAT #XLVIIIBLOCKS";
      const result = await caller.validateContent({ content });

      expect(result.isValid).toBe(true);
      expect(result.foundHashtags).toHaveLength(3);
      expect(result.missingHashtags).toHaveLength(0);
    });

    it("should detect missing hashtags", async () => {
      const caller = await createDistributionCaller();
      const content = "This is a test #MRWALKSHIT";
      const result = await caller.validateContent({
        content,
        requiredHashtags: ["#CHAISTHEGREAT", "#XLVIIIBLOCKS"],
      });

      expect(result.isValid).toBe(false);
      expect(result.foundHashtags).toContain("#MRWALKSHIT");
      expect(result.missingHashtags).toContain("#CHAISTHEGREAT");
      expect(result.missingHashtags).toContain("#XLVIIIBLOCKS");
    });

    it("should return success message when valid", async () => {
      const caller = await createDistributionCaller();
      const content =
        "Test #MRWALKSHIT #CHAISTHEGREAT #XLVIIIBLOCKS content";
      const result = await caller.validateContent({ content });

      expect(result.message).toContain("passed");
    });

    it("should return error message with missing hashtags", async () => {
      const caller = await createDistributionCaller();
      const content = "Test #MRWALKSHIT";
      const result = await caller.validateContent({
        content,
        requiredHashtags: ["#CHAISTHEGREAT"],
      });

      expect(result.message).toContain("Missing");
      expect(result.message).toContain("#CHAISTHEGREAT");
    });

    it("should handle content without any hashtags", async () => {
      const caller = await createDistributionCaller();
      const content = "This is plain text without any hashtags";
      const result = await caller.validateContent({ content });

      expect(result.foundHashtags).toHaveLength(0);
      expect(result.isValid).toBe(true); // Valid because no required hashtags specified
    });
  });
});
