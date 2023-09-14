import { chessRouter } from "./computers";
import { router } from "../trpc";

export const appRouter = router({
  chessGames: chessRouter,
});

export type AppRouter = typeof appRouter;
