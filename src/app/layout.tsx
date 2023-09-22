import './global.css'
import type { Metadata } from 'next'
import NextAuthProvider from "@/lib/auth/Provider";
import TrpcProvider from "@/lib/trpc/Provider";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/ui/theme-provider"
import Header from '@/components/app/header';



export const metadata: Metadata = {
  title: 'Chess Play',
  description: 'Generated by create next app',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
       
      <body className={"flex flex-col w-screen h-screen"}>
        <NextAuthProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <TrpcProvider>
              <Header></Header>
              {children}
              <Toaster />
            </TrpcProvider>
          </ThemeProvider>
        </NextAuthProvider>
      </body>
    </html>
  )
}
