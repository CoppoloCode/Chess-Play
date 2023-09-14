"use client"
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc/client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";



export default function Home() {

  const user = useSession();
  const router = useRouter();
  const createBoard = trpc.chessGames.createGame.useMutation();
  
  async function generateLocalGame(){
    const userId = user?.data?.user.id;
    const board = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
    
    if(!userId){
      return null
    }
    
    const res = await createBoard.mutateAsync({userId,board})
    router.replace(`/localgame/${res.id}`);
  }


  return (
    <section className='flex flex-col w-full h-full gap-2 justify-center items-center'>
      <Button onClick={()=>{generateLocalGame()}} className="w-64">Play Against AI</Button>
      <Button className="w-64">Play Against Human</Button>
      <Button className="w-64">View Ongoing Games</Button>
      <Button className="w-64">View Profile</Button>
    </section>
  )
}
