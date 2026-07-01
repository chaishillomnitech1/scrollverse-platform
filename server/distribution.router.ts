import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";

/**
 * Distribution data structure
 */
interface DistributionData {
  totalAmount: string;
  activeWallets: number;
  zakatPercentage: number;
  distributionCycles: number;
  sovereignHashtags: string[];
  flowStages: Array<{
    stage: string;
    amount: string;
    status: string;
  }>;
}

/**
 * Mock distribution data - in production, this would come from the database
 */
const mockDistributionData: DistributionData = {
  totalAmount: "$4,078,000",
  activeWallets: 12447,
  zakatPercentage: 7.77,
  distributionCycles: 144,
  sovereignHashtags: ["#MRWALKSHIT", "#CHAISTHEGREAT", "#XLVIIIBLOCKS"],
  flowStages: [
    { stage: "Collection", amount: "$100M", status: "ACTIVE" },
    { stage: "Validation", amount: "$97.23M", status: "ACTIVE" },
    { stage: "Zakat Calculation", amount: "$7.67M", status: "ACTIVE" },
    { stage: "Distribution", amount: "$90.5M", status: "ACTIVE" },
  ],
};

/**
 * Validate a hashtag against sovereign hashtags
 */
function validateSovereignHashtag(hashtag: string): boolean {
  return mockDistributionData.sovereignHashtags.includes(hashtag);
}

/**
 * Distribution router
 */
export const distributionRouter = router({
  /**
   * Get distribution stats
   */
  getStats: publicProcedure.query(async (): Promise<DistributionData> => {
    return mockDistributionData;
  }),

  /**
   * Get sovereign hashtags
   */
  getHashtags: publicProcedure.query(async (): Promise<string[]> => {
    return mockDistributionData.sovereignHashtags;
  }),

  /**
   * Validate a hashtag
   */
  validateHashtag: publicProcedure
    .input(z.object({ hashtag: z.string() }))
    .query(async ({ input }): Promise<{ isValid: boolean; hashtag: string }> => {
      const isValid = validateSovereignHashtag(input.hashtag);
      return {
        hashtag: input.hashtag,
        isValid,
      };
    }),

  /**
   * Get Zakat flow information
   */
  getZakatFlow: publicProcedure.query(
    async (): Promise<{
      percentage: number;
      description: string;
      isImmutable: boolean;
    }> => {
      return {
        percentage: mockDistributionData.zakatPercentage,
        description:
          "Eternal distribution rate - immutable and sovereign",
        isImmutable: true,
      };
    }
  ),

  /**
   * Get distribution flow stages
   */
  getFlowStages: publicProcedure.query(
    async (): Promise<
      Array<{
        stage: string;
        amount: string;
        status: string;
      }>
    > => {
      return mockDistributionData.flowStages;
    }
  ),

  /**
   * Validate multiple hashtags in content
   */
  validateContent: publicProcedure
    .input(
      z.object({
        content: z.string(),
        requiredHashtags: z.array(z.string()).optional(),
      })
    )
    .query(
      async ({
        input,
      }): Promise<{
        isValid: boolean;
        foundHashtags: string[];
        missingHashtags: string[];
        message: string;
      }> => {
        const foundHashtags: string[] = [];

        // Find all sovereign hashtags in content
        for (const hashtag of mockDistributionData.sovereignHashtags) {
          if (input.content.includes(hashtag)) {
            foundHashtags.push(hashtag);
          }
        }

        // Check for required hashtags if specified
        const requiredHashtags = input.requiredHashtags || [];
        const missingHashtags = requiredHashtags.filter(
          (tag) => !foundHashtags.includes(tag)
        );

        const isValid = missingHashtags.length === 0;

        return {
          isValid,
          foundHashtags,
          missingHashtags,
          message: isValid
            ? "Content validation passed - all sovereign hashtags present"
            : `Missing sovereign hashtags: ${missingHashtags.join(", ")}`,
        };
      }
    ),
});
