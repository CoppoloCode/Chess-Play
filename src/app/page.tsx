"use client"
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc/client";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";




const START_POS = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"


export default function Home() {

  const user = useSession();
  const router = useRouter();
  const createGame = trpc.chessGames.createGame.useMutation();
  const [chooseAi, setChooseAi] = useState(false);
  const [loading , setLoading] = useState(false);
  
  async function generateLocalGame(ai: number){

    const userId = user?.data?.user.id;
    
    setLoading(true);
    const res = await createGame.mutateAsync({userId: userId!, board: START_POS, ai: ai})
    
    router.replace(`/game/${res.id}`);
  }

  async function generateOnlineGame(){

    const userId = user?.data?.user.id;

    setLoading(true);
    const res = await createGame.mutateAsync({userId: userId!, board: START_POS, ai: -1})
    router.replace(`/onlinegame/${res.id}`);
  }


  return (
    <section className='flex flex-col w-full h-full gap-2 justify-center items-center'>
      {!user.data?.user && <h1>Please Sign In</h1>}
      {!chooseAi && user.data?.user && !loading && <> 
      <Button className="w-56" onClick={()=>{setChooseAi(true)}}>Play Against AI</Button>
      <Button className="w-56" onClick={()=>generateOnlineGame()}>Create Online Game</Button>
      <Button className="w-56" asChild><Link href={'/joingame'}>Join Game</Link></Button>
      <Button className="w-56" asChild><Link href={'/currentgames'}>View Current Games</Link></Button>
      <Button className="w-56" asChild><Link href={'/'}>View Profile</Link></Button></>}
      {chooseAi && !loading &&  <>
      <Button className="w-24" onClick={()=>{generateLocalGame(0)}}>Easy</Button>
      <Button className="w-24" onClick={()=>{generateLocalGame(1)}}>Medium</Button>
      <Button className="w-24" onClick={()=>{generateLocalGame(2)}}>Hard</Button>
      <Button className="w-24" onClick={()=>{generateLocalGame(3)}}>Very Hard</Button>
      <Button className="w-24" onClick={()=>{generateLocalGame(4)}}>Godlike</Button>
      <Button className="w-24" onClick={()=>{setChooseAi(false)}}>Back</Button>
      </>}
      {loading && <Loader2 className="animate-spin w-32 h-32"></Loader2>}
    </section>
  )
}
