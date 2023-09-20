"use client"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";



export default function JoinGame() {

  const [code, setCode] = useState("");

  
  
  return (
    <section className='flex flex-col w-full h-full gap-2 items-center pt-36'>
      <h1 className="text-2xl">Invite Code:</h1>
      <form className="flex flex-col justify-center gap-2 items-center">
        <Input minLength={25} maxLength={25} required onChange={(e)=>setCode(e.target.value)} className="w-fit"></Input>
        {code.length === 25 && <Button type="submit" asChild><Link  type="submit" href={`/onlinegame/${code}`}>Join Game</Link></Button> }
      </form>
    </section>
  )
}
