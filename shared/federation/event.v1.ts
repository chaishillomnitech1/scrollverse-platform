import { z } from "zod";

const uuidSchema = z.string().uuid();
const sha1Schema = z.string().regex(/^[a-fA-F0-9]{40}$/);
const sha256Schema = z.string().regex(/^[a-fA-F0-9]{64}$/);

export const FederationEventV1Schema = z
  .object({
    schema_version: z.literal("1.0.0"),
    event_id: uuidSchema,
    event_type: z.string().regex(/^[a-z][a-z0-9_.-]{1,99}$/),
    occurred_at: z.string().datetime({ offset: true }),
    producer: z
      .object({
        repository: z.string().regex(/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/),
        service: z.string().min(1),
        specialist_profile: z.string().optional(),
      })
      .strict(),
    subject: z.string().min(1),
    correlation_id: uuidSchema,
    causation_id: uuidSchema.optional(),
    classification: z.enum(["PUBLIC", "INTERNAL", "CONFIDENTIAL", "RESTRICTED"]),
    payload: z.record(z.string(), z.unknown()),
    provenance: z
      .object({
        source_ref: z.string().min(1),
        commit_sha: sha1Schema.optional(),
        content_sha256: sha256Schema.optional(),
      })
      .strict(),
    policy: z
      .object({
        permitted_actions: z.array(z.enum(["read", "index", "propose_change"])).min(1),
        retention_days: z.number().int().min(1).max(3650).optional(),
      })
      .strict(),
  })
  .strict();

export type FederationEventV1 = z.infer<typeof FederationEventV1Schema>;

/**
 * Validate an incoming federated event before it enters a consumer queue.
 * This function validates shape only; authorization, classification policy,
 * signature verification, replay protection and idempotency remain mandatory
 * at the transport/consumer boundary.
 */
export function parseFederationEventV1(input: unknown) {
  return FederationEventV1Schema.safeParse(input);
}
