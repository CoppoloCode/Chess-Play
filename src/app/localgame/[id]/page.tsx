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
import Link from "next/link"
import { Input } from "@/components/ui/input"


const winConditions = ["Checkmate", "Draw", "Stalemate", "Repetition"]

export default function LocalGame(){

    const params = useParams()
    const boardId = params.id as string;
    const [pickColor, setPickColor] = useState(true);
    const [playerColor, setPlayerColor] = useState<string>("")
    const [boardPosition, setBoardPosition] = useState<BoardOrientation>('white');
    const [gameOver, setGameOver] = useState(false);
    const [aiDifficulty, setAiDifficulty] = useState<number>(0);

    

    if(!boardId || boardId === ""){
        return(
            <section className="flex h-full w-full justify-center items-center">
                <h1>ERROR</h1>
            </section>
        )
    }

    const boardQuery = trpc.chessGames.getGame.useQuery({boardId})
    const colorQuery = trpc.chessGames.setColor.useMutation();
    const updateBoardQuery = trpc.chessGames.updateBoard.useMutation();
    const deleteBoardQuery = trpc.chessGames.removeBoard.useMutation();

     //@ts-ignore
    const [game, setGame] = useState<Chess | undefined>()
    const [aiTurn, setAiTurn] = useState(false);
   
   useEffect(()=>{
    
       if(aiTurn && !gameOver){
           makeAiMove();
       }

   },[aiTurn])

   useEffect(()=>{
        
        if(boardQuery.isFetched && boardQuery.data?.playerOneColor){
            setPickColor(false);
            setPlayerColor(boardQuery.data.playerOneColor);
            if(boardQuery.data.playerOneColor === 'b'){
                setBoardPosition('black')
            }
            setGame(()=>{
                //@ts-ignore
                const game = Chess(boardQuery.data.board)
                setAiTurn(game.turn() === boardQuery.data?.playerOneColor ? false : true)
                return game
            })
            setAiDifficulty(boardQuery.data.ai!);
        }
       
   },[boardQuery.isFetched, boardQuery.isRefetching])
        
    
        

   

    function makeAiMove(){

        const aiMoveObj =  aiMove(game.fen(),aiDifficulty);
    
        setTimeout(()=>{
            const moveSet = Object.entries<string>(aiMoveObj)
            const move = {
                from: moveSet[0][0].toLowerCase(),
                to: moveSet[0][1].toLowerCase(),
                promotion: "q"
            } as ShortMove
            makeAMove(move);
            updateBoardQuery.mutate({boardId: boardId, board: game.fen()})

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

        const res = updateBoardQuery.mutate({boardId: boardId, board: game.fen()})
        return true;
    }

    async function setColor(color : string){


        const res = await colorQuery.mutateAsync({boardId: boardId, color: color});
        boardQuery.refetch();

        if(color ==='b'){
            setBoardPosition('black')
        }

        setPlayerColor(color)
        setPickColor(false);

    }
     
    function isYourColor(piece: Piece){

        if(piece[0] === boardPosition[0]){
            return true;
        }
        return false
    }

    function deleteBoard(){

        deleteBoardQuery.mutate({boardId: boardId})
    }
    
    function resignGame(){
        setGameOver(true);
        deleteBoard();
    }

    if(game && game.game_over() && !gameOver){
        setGameOver(true);
    }


    return (
       
         <section className="flex h-full w-full justify-center items-center">
            {!boardQuery.isFetched ? 
            <div>
                <Loader2 className="flex animate-spin w-32 h-32"></Loader2>
            </div> : !pickColor  ? 
            <div className="flex justify-center items-center h-full">
                {gameOver && <div className="flex flex-col justify-around items-center absolute z-10 rounded-md bg-slate-600 w-64 h-64">
                        {game.turn() === playerColor && game.in_checkmate() && <h1 className="text-2xl">You lost by <br></br> Checkmate</h1>}
                        {game.turn() !== playerColor && game.in_checkmate() && <h1 className="text-2xl">You won by <br></br> Checkmate</h1>}
                        {game.in_draw() && <h1 className="text-3xl">Draw</h1>}
                        {game.in_stalemate() && <h1 className="text-3xl">Stalemate</h1>}
                        {game.in_threefold_repetition() && <h1 className="text-3xl">Repetition</h1>}
                        <Link onClick={()=>deleteBoard()} className="flex justify-center items-center rounded-md font-medium bg-slate-100 text-black h-10 w-1/2" href={"/"}>Back to Home</Link>
                    </div>}
                {game && (
                <>
                <Chessboard isDraggablePiece={({piece})=>isYourColor(piece)} boardOrientation={boardPosition} boardWidth={800} position={game.fen()} onPieceDrop={onDrop}></Chessboard>
                <div className="flex flex-col bg-slate-700 h-[80%] w-[600px] rounded-md">
                    <div className="flex flex-col h-full w-full items-center justify-between p-3">
                        <div className="flex flex-col h-full w-full items-center p-2 gap-2">
                            <h1 className="text-3xl">Chat</h1>
                            <div className="flex h-[90%] w-[90%] bg-slate-500 rounded-lg">

                            </div>
                        </div>
                        <div className="flex w-full justify-between">
                            <Button onClick={()=>resignGame()}>Resign</Button>
                            <div className="flex gap-2">
                                <Input></Input>
                                <Button>Send</Button>
                            </div>
                        </div>
                    </div>
                    <div>

                    </div>
                </div></>)}
            </div>
             : boardQuery.data ?
            <div className="flex flex-col justify-center items-center gap-2">
                <h1>Play As</h1>
                <Button onClick={()=>setColor('w')}>White</Button>
                <Button onClick={()=>setColor('b')}>Black</Button>
            </div> : <div>No Board found.</div>}
        </section>
       
    )
}