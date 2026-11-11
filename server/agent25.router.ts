import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { AGENT25_AGENTS, selectAgent } from "../shared/agent25";
import { extractProviderReply, readBoundedProviderBody, validateProviderEndpoint, MAX_PROVIDER_RESPONSE_BYTES } from "./agent25.security";
import { publicProcedure, router } from "./_core/trpc";
import { enforceAgent25RateLimit } from "./agent25.rate-limit";

const siteIds = ["scrollverse", "scrollatlas", "omnitech1", "generic"] as const;

