"use client";

import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const { data: session, isPending, error } = authClient.useSession();

  const router = useRouter()

  useEffect(() => {
    if (isPending) {
      console.log("Checking session...");
      return;
    }

    if (error) {
      console.error("Session error:", error);
      return;
    }

    console.log("Full session:", session);
    console.log("User:", session?.user ?? "No logged-in user");
  }, [session, isPending, error]);

  if (isPending) {
    return <p>Loading session...</p>;
  }

  if (!session) {
    return <p>You are not logged in.</p>;
  }

  return (
    <div className="flex items-center justify-between">
      <div>
      <h1>Welcome, {session.user.name}</h1>
      <p>Email: {session.user.email}</p>
      </div>
      <button onClick={()=>authClient.signOut({
        fetchOptions : {
          onSuccess : () =>{
            router.push("/login")
          }
        }
      })}>signout</button>
    </div>
  );
}