import { db } from "@/db/drizzle"
import { getSession } from "@/lib/auth-guard"
import { NextRequest, NextResponse } from "next/server"


export const GET = async(req: NextRequest) =>{
    try {
        const userId = await getSession()

        if(!userId){
            return NextResponse.json({
                success : false,
                message : "Not Authenticated"
            }, {status : 401})
        }

        const organizationId = await req.json()

        if(!organizationId){
            return NextResponse.json({
                success : false,
                message : "Organization id incorrect or not provided"
            }, {status : 404})
        }

        const data = await db.query.TicketTable.findMany({
            where : {
                organizationId : organizationId
            },
            with : {
                user : true,
                organization : true,
                ticketAssigned : true
            }
        })

        return NextResponse.json({
            success : true,
            message : "Organization tickets fetched successfully",
            data : data
        })
    } catch (error) {
        console.error("Error GETting organization tickets")
        return NextResponse.json({
            success : false,
            message : "Internal Server Error"
        },{status : 500})
    }
}


export const POST = async(req:NextRequest) =>{
    try {
        const userId = await getSession()

        const formData = await req.formData()

        const name = formData.get("name") as string
        const description = formData.get("description") as string
        const contact = formData.get("contact") as string

        if(!name || !description){
            return NextResponse.json({
                success : false,
                message : "Name and description required"
            })
        }

        const image = formData.getAll("image")


        

    } catch (error) {
        
    }
}