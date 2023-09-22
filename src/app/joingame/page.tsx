"use client"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";



export default function JoinGame() {

  const [code, setCode] = useState("");

  
  
  return (
    <section className='flex flex-col w-full h-full gap-6 items-center pt-36'>
      <h1 className="text-5xl">Invite Code</h1>
      <Input minLength={25} maxLength={25} required onChange={(e)=>setCode(e.target.value)} className="w-[40%] text-4xl text-center"></Input>
      {code.length === 25 && <Button type="submit" asChild><Link  type="submit" href={`/onlinegame/${code}`}>Join Game</Link></Button> }
      
    </section>
  )
}
