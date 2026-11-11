import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { distributionRouter } from "./distribution.router";
import { agent25Router } from "./agent25.router";

export const appRouter = router({
  // All public visitor-facing capabilities must remain informational and read-only.
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  distribution: distributionRouter,
  agent25: agent25Router,
});

export type AppRouter = typeof appRouter;
