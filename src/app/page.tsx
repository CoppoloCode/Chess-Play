import SignIn from '@/components/auth/SignIn'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

export default function Home() {
  return (
    <section className='flex flex-col h-screen w-screen justify-center items-center'>
      <SignIn></SignIn>
    </section>
  )
}
