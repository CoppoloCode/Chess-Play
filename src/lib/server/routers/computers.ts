
import { db } from "@/lib/db";
import {z} from 'zod'
import { publicProcedure, router } from "../trpc";


export const chessRouter = router({
  getGames: publicProcedure.input(z.object({boardId: z.string()})).query(async (opts) => {
    const {boardId} = opts.input;
    const res =  db.games.findFirst({where: {id: boardId}});
    return res
  }),
  createGame: publicProcedure.input(z.object({userId: z.string(), board: z.string()})).mutation(async (opts)=>{
    const {userId, board} = opts.input;
    const res = await  db.games.create({data: {playerOneId: userId, Board: board}})
    return res
  })

})
