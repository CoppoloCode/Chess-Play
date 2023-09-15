
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
  }),
  setColor: publicProcedure.input(z.object({boardId: z.string(), color: z.string()})).mutation(async (opts)=>{
    const {boardId, color} = opts.input;
    const res = await db.games.update({where: {id: boardId}, data:{playerOneColor: color}})
    return res;
  }),
  updateBoard: publicProcedure.input(z.object({boardId: z.string(), board: z.string()})).mutation(async (opts)=>{
    const {boardId, board} = opts.input;
    const res = await db.games.update({where: {id: boardId}, data: {Board: board}});
    return res;
  })

})
