"use client"
import { trpc } from "@/lib/trpc/client"
import { useParams } from "next/navigation"
//@ts-ignore
import { aiMove } from 'js-chess-engine'
import  Chess, {ShortMove, Square, } from "chess.js"
import { Chessboard } from "react-chessboard"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { BoardOrientation, Piece } from "react-chessboard/dist/chessboard/types"

const START_POS = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"

export default function LocalGame(){

    const params = useParams()
    const boardId = params.id as string;
    const [pickColor, setPickColor] = useState(true);
    const [boardPosition, setBoardPosition] = useState<BoardOrientation>('white');

    

    if(!boardId || boardId === ""){
        return(
            <section className="flex h-full w-full justify-center items-center">
                <h1>ERROR</h1>
            </section>
        )
    }

    const boardQuery = trpc.chessGames.getGames.useQuery({boardId}).data
    const colorQuery = trpc.chessGames.setColor.useMutation();
    const updateBoardQuery = trpc.chessGames.updateBoard.useMutation();

     //@ts-ignore
    const [game, setGame] = useState<Chess | undefined>()
    const [aiTurn, setAiTurn] = useState(false);
   
   useEffect(()=>{
    
       if(aiTurn){
           makeAiMove();
       }
   },[aiTurn])

    useEffect(()=>{
        
        if(boardQuery?.playerOneColor){
            setPickColor(false);
            if(boardQuery.playerOneColor === 'b'){
                setBoardPosition('black')
            }
            
        }
        if(boardQuery){
           
            setGame((prev: typeof Chess)=>{
                //@ts-ignore
                const game = Chess(boardQuery.Board)
                setAiTurn(game.turn() === boardQuery.playerOneColor ? false : true)
                return game
            })
            
            
        }

    },[boardQuery])

    function makeAiMove(){

        const aiMoveObj =  aiMove(game.fen(),2);
    
        setTimeout(()=>{
            const moveSet = Object.entries<string>(aiMoveObj)
            const move = {
                from: moveSet[0][0].toLowerCase(),
                to: moveSet[0][1].toLowerCase(),
                promotion: "q"
            } as ShortMove
            makeAMove(move);
            updateBoardQuery.mutate({boardId: boardQuery!.id, board: game.fen()})

        },2000)
       
        
    }

    function makeAMove(move: string | ShortMove){
        const gameCopy = {...game};
        const result = gameCopy.move(move);
        
        setGame(gameCopy);
        if(result){
            setAiTurn(!aiTurn)
        }
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

        const res = updateBoardQuery.mutate({boardId: boardQuery!.id, board: game.fen()})
        return true;
    }

    async function setColor(color : string){

        if(!boardQuery?.id){
            return null
        }

        const res = await colorQuery.mutateAsync({boardId: boardQuery.id, color: color});

        if(color ==='b'){
            setBoardPosition('black')
        }
        
        setPickColor(false);

    }
     
    function isYourColor(piece: Piece){

        if(piece[0] === boardPosition[0]){
            return true;
        }
        return false
    }

    return (
       
         <section className="flex h-full w-full justify-center items-center">
            {!boardQuery ? 
            <div>
                <Loader2 className="flex animate-spin w-64"></Loader2>
            </div> : !pickColor && !game.game_over() ? 
            <div>
                <Chessboard isDraggablePiece={({piece})=>isYourColor(piece)} boardOrientation={boardPosition} boardWidth={800} position={game.fen()} onPieceDrop={onDrop}></Chessboard>
            </div> : !pickColor && game.game_over() ?
            <div>
                <h1>Game Over</h1>
            </div> : 
            <div className="flex flex-col justify-center items-center gap-2">
                <Button onClick={()=>setColor('w')}>White</Button>
                <Button onClick={()=>setColor('b')}>Black</Button>
            </div>}
        </section>
       
    )
}