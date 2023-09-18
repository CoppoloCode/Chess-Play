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
  const createBoard = trpc.chessGames.createGame.useMutation();
  const [chooseAi, setChooseAi] = useState(false);

  
  async function generateLocalGame(ai: number){
    const userId = user?.data?.user.id;
    
    
    if(!userId){
      return null
    }
    
    const res = await createBoard.mutateAsync({userId: userId, board: START_POS, ai: ai})
    router.replace(`/localgame/${res.id}`);
  }

 


  return (
    <section className='flex flex-col w-full h-full gap-2 justify-center items-center'>
      {!chooseAi && !createBoard.isLoading &&<> 
      <Button onClick={()=>{setChooseAi(true)}}>Play Against AI</Button>
      <Button asChild><Link href={'/'} >Play Against Human</Link></Button>
      <Button asChild><Link href={'/currentgames'}>View Current Games</Link></Button>
      <Button asChild><Link href={'/'}>View Profile</Link></Button></>}
      {chooseAi && !createBoard.isLoading && <>
      <Button className="w-24" onClick={()=>{generateLocalGame(0)}}>{createBoard.isLoading ? <Loader2 className="w-32 h-32 animate-spin"></Loader2> : "Easy"}</Button>
      <Button className="w-24" onClick={()=>{generateLocalGame(1)}}>{createBoard.isLoading ? <Loader2 className="w-32 h-32 animate-spin"></Loader2> : "Medium"}</Button>
      <Button className="w-24" onClick={()=>{generateLocalGame(2)}}>{createBoard.isLoading ? <Loader2 className="w-32 h-32 animate-spin"></Loader2> : "Hard"}</Button>
      <Button className="w-24" onClick={()=>{generateLocalGame(3)}}>{createBoard.isLoading ? <Loader2 className="w-32 h-32 animate-spin"></Loader2> : "Very Hard"}</Button>
      <Button className="w-24" onClick={()=>{generateLocalGame(4)}}>{createBoard.isLoading ? <Loader2 className="w-32 h-32 animate-spin"></Loader2> : "Godlike"}</Button>
      <Button className="w-24" onClick={()=>{setChooseAi(false)}}>Back</Button>
      </>}
      
    </section>
  )
}
