"use client"

import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc/client"
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface difficultyType {[key: number] : string}
const difficulty: difficultyType = {
    0 : "Easy",
    1 : "Medium",
    2 : "Hard",
    3 : "Very Hard",
    4 : "Godlike",
}

export default function CurrentGames(){

    const user = useSession()

    const currentGamesQuery = trpc.chessGames.getGames.useQuery({userId: user.data?.user.id ?? ""});

    
    return (
        <section className="flex flex-col h-full justify-center items-center gap-2">
            {currentGamesQuery.isFetched && currentGamesQuery.data!.length > 0  && currentGamesQuery.data?.map((game)=>{
                return <Link className="flex justify-center items-center rounded-md font-medium bg-slate-100 text-black h-10 w-64" href={game.ai !== -1 ? `/game/${game.id}` : `/onlinegame/${game.id}`}>{game.ai !== -1 ?`Resume game with ${difficulty[game.ai!]} AI` : "Resume online game"}</Link>
            })}
            {currentGamesQuery.isFetched && currentGamesQuery.data!.length === 0 && <h1>No active games.</h1>}
            {currentGamesQuery.isFetched && <Link className="flex justify-center items-center rounded-md font-medium bg-slate-100 text-black h-10 w-64" href={`/`}>Back to Home</Link>}
            {currentGamesQuery.isLoading && <Loader2 className="animate-spin w-32 h-32"></Loader2>}
        </section>)
}