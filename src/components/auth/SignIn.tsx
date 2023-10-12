"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "../ui/button";
import Router from "next/router";

export default function SignIn() {
  const { data: session, status } = useSession();

  if (status === "loading") return <div>Loading...</div>;

  if (session) {
    return (
      <>
        <Button variant={"destructive"} onClick={() => {signOut(); Router.replace('/')}}>Sign out</Button>
      </>
    );
  }
  return (
    <>
      <Button onClick={() => signIn()}>Sign in</Button>
    </>
  );
}