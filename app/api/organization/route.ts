import { getSession } from "@/lib/auth-guard";
import { NextRequest, NextResponse } from "next/server";

// Create organization

export const POST = async(req:NextRequest, res:NextResponse) =>{

    const session = await getSession()

    if(!session){
        return NextResponse.json({
            success : false,
            message : "Unauthorised"
        },{status : 401})
    }

    const formData = await req.formData()

    const name =  formData.get("name")
    const slug = formData.get("slug")

    if(!name || !slug){
        return NextResponse.json({
            success : false,
            message : "Missing fields"
        }, {status : 401})
    }

    const userId = session.user.id
}


// Update organization

// Delete organization
