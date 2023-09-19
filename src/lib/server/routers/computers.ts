
import { db } from "@/lib/db";
import {string, z} from 'zod'
import { publicProcedure, router } from "../trpc";


export const chessRouter = router({
  getGame: publicProcedure.input(z.object({boardId: z.string()})).query(async (opts) => {
    const {boardId} = opts.input;
    const res = await db.games.findFirst({where: {id: boardId}});
    return res
  }),
  getGames: publicProcedure.input(z.object({userId: z.string()})).query(async (opts)=>{
    const {userId} = opts.input;
    const res1 = await db.games.findMany({where:{playerOneId: userId}});
    const res2 = await db.games.findMany({where: {playerTwoId: userId}});
    const games = [...res1, ...res2];
    return games;

  }),
  createGame: publicProcedure.input(z.object({userId: z.string(), board: z.string(), ai: z.number()})).mutation(async (opts)=>{
    const {userId, board, ai} = opts.input;
    const res = await  db.games.create({data: {playerOneId: userId, board: board, ai: ai}})
    return res
  }),
  setColor: publicProcedure.input(z.object({boardId: z.string(), color: z.string()})).mutation(async (opts)=>{
    const {boardId, color} = opts.input;
    const res = await db.games.update({where: {id: boardId}, data:{playerOneColor: color}})
    return res;
  }),
  updateBoard: publicProcedure.input(z.object({boardId: z.string(), board: z.string()})).mutation(async (opts)=>{
    const {boardId, board} = opts.input;
    const res = await db.games.update({where: {id: boardId}, data: {board: board}});
    return res;
  }),
  removeBoard: publicProcedure.input(z.object({boardId: z.string()})).mutation(async (opts)=>{
    const {boardId} = opts.input;
    const res = await db.games.delete({where:{id: boardId}});
    return res;
  }),
  updatePlayerTwo: publicProcedure.input(z.object({boardId: z.string(), userId: z.string()})).mutation(async (opts)=>{
    const {boardId, userId} = opts.input;
    const res = await db.games.update({where: {id: boardId}, data:{playerTwoId: userId}});
    return res;

  })

})
