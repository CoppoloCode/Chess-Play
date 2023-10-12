"use client"
import { trpc } from "@/lib/trpc/client"
import { useParams } from "next/navigation"
import ConnectToServer from '../../server/connect'
import  Chess, {ShortMove, Square, } from "chess.js"
import { Chessboard } from "react-chessboard"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { BoardOrientation, Piece } from "react-chessboard/dist/chessboard/types"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Socket } from "socket.io-client"
import { useSession } from "next-auth/react"
import Image from "next/image"


export default function LocalGame(){

    const params = useParams()
    const {data} = useSession();
    const userId = data?.user.id;
    const boardId = params.id as string;
    const [socket, setSocket] = useState<Socket | null>(null)
    const [playerColor, setPlayerColor] = useState<string>("")
    const [boardPosition, setBoardPosition] = useState<BoardOrientation>('white');
    const [gameOver, setGameOver] = useState(false);
    const [pickColor, setPickColor] = useState(true);
    const [playerResigned, setPlayerResigned] = useState(false);
    const [message, setMessage] = useState("");
    const [chat, setChat] = useState<Array<any>>([]);
    //@ts-ignore
    const [game, setGame] = useState<Chess | undefined>();
    const boardQuery = trpc.chessGames.getGame.useQuery({boardId});
    const updateBoardQuery = trpc.chessGames.updateBoard.useMutation();
    const updatePlayerTwoQuery = trpc.chessGames.updatePlayerTwo.useMutation();
    const deleteBoardQuery = trpc.chessGames.removeBoard.useMutation();
    const colorQuery = trpc.chessGames.setColor.useMutation();
    const screenWidth = Math.abs(window?.screen.width) > 800 ? 800 : 350;
    
   useEffect(()=>{
    
    setSocket(ConnectToServer(boardId));

    return ()=>{
        socket?.disconnect()
    }
   },[])

   useEffect(() => {
    if (!socket) return;
  
    socket?.on('sendBoard', (boardData)=>{
    
        if(boardData.board === 'resigned'){
            setPlayerResigned(true);
            setGameOver(true);
        }else{
            //@ts-ignore
            setGame(Chess(boardData.board))
        }
   })

    socket?.on('sendMessage', (messageData)=>{
       
        setChat((prev)=>{
            prev.push({user: "opponent" , message: messageData.message});
            return [...prev];
        })    
    })
  
    return () => {
      socket.off("sendBoard");
      socket.off("sendMessage");
    };
  }, [socket]);
        
    
    useEffect(()=>{

        if(boardQuery.isFetched && userId && (boardQuery.data?.playerTwoId === null) && (boardQuery.data?.playerOneId !== userId)){
            updatePlayerTwoQuery.mutate({boardId, userId})
            boardQuery.refetch();
        }
        if(boardQuery.isFetched && boardQuery.data?.playerOneColor){
            setPickColor(false);
        }
        if(boardQuery.isFetched && boardQuery.data?.playerOneId && boardQuery.data.playerTwoId){
            if(boardQuery.data.playerOneId === userId && boardQuery.data.playerOneColor){
                setPlayerColor(boardQuery.data.playerOneColor!);
                if(boardQuery.data.playerOneColor === 'b'){
                    setBoardPosition('black');
                }
                
            }else{
                if(boardQuery.data.playerOneColor === 'w'){
                    setPlayerColor('b')
                    setBoardPosition('black')
                }else{
                    setPlayerColor('w');
                }
               
            }
        }
         //@ts-ignore
         setGame(Chess(boardQuery.data?.board));

    },[boardQuery.isFetched, boardQuery.isRefetching]) 

   
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
          promotion: 'q', // always promote to a queen for example simplicity
        });
    
        
        // illegal move
        if (move === null) return false;

        const res = updateBoardQuery.mutate({boardId: boardId, board: game.fen()})
        const boardData = {id: boardId, board: game.fen()}
        socket?.emit('sendBoard', boardData);
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
        const boardData = {id: boardId, board: 'resigned'}
        socket?.emit('sendBoard', boardData);
       
    }

    function handleSendMessage(){
        const messageData = {id: boardId, message: message}
        
        socket?.emit('sendMessage', messageData);
        setChat((prev)=>{
            prev.push({user: "self", message: messageData.message});
            return [...prev];
        })
        setMessage("");
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
                    {!game.in_checkmate() && !game.in_draw() && !game.in_stalemate() && !game.in_threefold_repetition() && !playerResigned && <h1 className="text-2xl">You resigned</h1>}
                    {!game.in_checkmate() && !game.in_draw() && !game.in_stalemate() && !game.in_threefold_repetition() && playerResigned && <h1 className="text-2xl">Player resigned</h1>}
                    <Link onClick={()=>deleteBoard()} className="flex justify-center items-center rounded-md font-medium bg-slate-100 text-black h-10 w-1/2" href={"/"}>Back to Home</Link>
                </div>}
            {game && (
            <div className="flex flex-col md:flex-row gap-5 h-full justify-center items-center">
                <div>
                    <h1>Invite Code: {boardId}</h1>
                    <Chessboard autoPromoteToQueen={true} isDraggablePiece={({piece})=>isYourColor(piece)} boardOrientation={boardPosition} boardWidth={screenWidth} position={game.fen()} onPieceDrop={onDrop}></Chessboard>
                </div>
                <div className="flex flex-col bg-slate-700 h-[32rem] rounded-md p-3">
                    <div className="flex flex-col h-full w-full items-center p-2 gap-2">
                        <h1 className="text-3xl">Chat</h1>
                        <div className="flex flex-col h-[90%] w-[90%] bg-slate-500 rounded-lg p-5 overflow-y-scroll">
                            {chat.map((message, indx)=>{
                                if(message.user === "opponent"){
                                    return <div key={indx} className="flex items-center"><p>{message.message}</p></div>
                                } 
                                return <div key={indx} className="flex justify-end items-center"><p>{message.message}</p></div>
                            })}
                        </div>
                    </div>
                    <div className="flex w-full justify-between">
                        <Button onClick={()=>resignGame()}>Resign</Button>
                        <div className="flex gap-2">
                            <Input onChange={(e)=>setMessage(e.target.value)}></Input>
                            <Button onClick={()=>handleSendMessage()}>Send</Button>
                        </div>
                    </div>
                </div>
            </div>)}
        </div>
         : boardQuery.data ?
        <div className="flex flex-col justify-center items-center gap-2">
            <h1 className="text-4xl">Choose Color</h1>
            <div className="flex gap-6">
                    <Button className="h-fit bg-transparent" onClick={()=>setColor('w')}><Image width={128} height={128} alt="" src="/white-pawn.png"></Image></Button>
                    <Button className="h-fit bg-transparent" onClick={()=>setColor('b')}><Image width={128} height={128} alt="" src="/black-pawn.png"></Image></Button>
            </div>
        </div> : <div>Game Not Found.</div>}
    </section>
       
    )
}