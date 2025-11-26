import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

/**
 * Health check router for verifying API is operational
 */
export const healthRouter = createTRPCRouter({
  ping: publicProcedure.query(() => {
    return { status: "ok", timestamp: new Date().toISOString() };
  }),
});
