import { router, publicProcedure } from '../init';

export const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return 'OK';
  }),
});

export type AppRouter = typeof appRouter;
