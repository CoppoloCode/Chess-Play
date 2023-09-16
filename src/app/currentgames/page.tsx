"use client"

import { trpc } from "@/lib/trpc/client"
import { useSession } from "next-auth/react";
import Link from "next/link";



export default function CurrentGames(){

    const user = useSession()

    

    const currentGamesQuery = trpc.chessGames.getGames.useQuery({userId: user.data?.user.id ?? ""}).data;


    return (
        <section className="flex flex-col justify-center items-center gap-2">
            {currentGamesQuery?.map((game)=>{
                return <Link className="flex justify-center items-center rounded-md font-medium bg-slate-100 text-black h-10 w-64" href={`/localgame/${game.id}`}>{!game.playerTwoId ? "game against AI" : "game against user"}</Link>
            })}
        </section>)
}