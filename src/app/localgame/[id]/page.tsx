"use client"
import { trpc } from "@/lib/trpc/client"
import { useParams } from "next/navigation"
import  Chess, {ShortMove, Square, } from "chess.js"
import { Chessboard } from "react-chessboard"
import { useState } from "react"


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
    
    //@ts-ignore
    const [game, setGame] = useState(Chess(boardQuery?.Board))

    function makeAMove(move: string | ShortMove){
        const gameCopy = {...game};
        const result = gameCopy.move(move);
        setGame(gameCopy);
        return result; // null if the move was illegal, the move object if the move was legal
    }
    
    function onDrop(sourceSquare: Square, targetSquare: Square) {
        const move = makeAMove({
          from: sourceSquare,
          to: targetSquare,
          promotion: "q", // always promote to a queen for example simplicity
          
        });
    
        // illegal move
        if (move === null) return false;

        return true;
      }

    return (<>
        <section className="flex h-full w-full justify-center items-center">
            <div>
                <Chessboard boardWidth={800} position={game.fen()} onPieceDrop={onDrop}></Chessboard>
            </div>
        </section>
        </>
    )
}