import { requireGuest } from "@/lib/auth-guard";
import React from "react";

export default async function OpenLayout({children}:{children : React.ReactNode}){
    await requireGuest();

    return <>{children}</>
}