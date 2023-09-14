"use client"
import { trpc } from "@/lib/trpc/client"
import { useParams } from "next/navigation"
import {Chess } from "chess.js"
import { useEffect } from "react"




export default function LocalGame(){

    const params = useParams()
    const boardId = params.id as string;

    if(!boardId || boardId === ""){
        return(
            <section className="flex h-full w-full justify-center items-center">
                <h1>ERROR</h1>
            </section>
        )
    }

    const boardQuery = trpc.chessGames.getGames.useQuery({boardId}).data
    console.log(boardQuery?.Board)
    const game = new Chess()
    
    

    return (
        <section className="flex h-full w-full justify-center items-center">
            {game.ascii()}
        </section>
    )
}