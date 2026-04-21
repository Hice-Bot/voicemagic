import { createTRPCRouter } from '../init';
import { billingRouter } from './billing';
import { generationsRouter } from './generations';
import { voicesRouter } from './voices';
import { apiKeysRouter } from './api-keys';
export const appRouter = createTRPCRouter({
  voices: voicesRouter,
  generations: generationsRouter,
  billing: billingRouter,
  apiKeys: apiKeysRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
