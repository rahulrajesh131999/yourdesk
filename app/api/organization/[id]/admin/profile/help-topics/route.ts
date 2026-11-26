import { db } from "@/db/drizzle"
import { getSession } from "@/lib/auth-guard"
import { NextResponse } from "next/server"

export const GET = async({params}:{params:Promise<{id:string}>})=>{

try {
        const session = await getSession()

    if(!session){
        return NextResponse.json({
            success : false,
            message : "Unauthenticated"
        },{status:401})
    }

    const userId = session.user.id

    const {id} = await params

    const organizationId = Number(id)

    if(typeof(organizationId) != "number" || !Number.isSafeInteger(organizationId)){
        return NextResponse.json({
            success : false,
            message : "Invalid organization id"
        },{status:400})
    }

    const organization = await db.query.OrganizationTable.findFirst({
        where : {
            id : organizationId
        },
        with : {
            helpTopics : true
        }
    })

    if(!organization || !organization.helpTopics){
        return NextResponse.json({
            success : false,
            message : "organization or helptopics not found"
        })
    }
} catch (error) {
    
}


}

export const POST = async({params}:{params : Promise<{id:string}>})=>{

    try {

        const session = await getSession()

    if(!session){
        return NextResponse.json({
            success : false,
            message : "Unauthenticated"
        },{status:401})
    }

    const userId = session.user.id

    const {id} = await params

    const organizationId = Number(id)

    if(typeof(organizationId) != "number" || !Number.isSafeInteger(organizationId)){
        return NextResponse.json({
            success : false,
            message : "Invalid organization id"
        },{status:400})
    }

    const organization = await db.query.OrganizationTable.findFirst({
        where : {
            id : organizationId
        },
        with : {
            helpTopics : true,
            organizationMember : true
        }
    })

    if(!organization || !organization.helpTopics){
        return NextResponse.json({
            success : false,
            message : "organization or helptopics not found"
        })
    }
    // user authorization checking
        
    } catch (error) {
        
    }

}

export const PATCH = async()=>{
    
}