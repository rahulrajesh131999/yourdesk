
import { db } from "@/db/drizzle"
import { getSession } from "@/lib/auth-guard"
import { success } from "better-auth"
import { NextRequest, NextResponse } from "next/server"


export const GET = async({params}:{params : Promise<{id:string}>})=>{

try {
        const {id} = await params

    const session = await getSession()

    if(!session){
        return NextResponse.json({
            success : false,
            message : "User not authorized"
        },{status : 401})
    }

    const userid = session.user.id

    console.log(id)

    const organizationId = Number(id)

    if(typeof(organizationId) !== "number" || !Number.isSafeInteger(organizationId)){
        return NextResponse.json({
            success : false,
            message : "Invalid organization id"
        })
    }

    const organization = await db.query.OrganizationTable.findFirst({
        where:{
            id:organizationId
        },
        with : {
            profile : true,
            socialMedia : true,
            helpTopics:true,
            supportHours : true,
            organizationFeedback : true,
            organizationMember : true,
            organizationTicket : true

        }
    })

    if(!organization){
        return NextResponse.json({
            success : false,
            message : "Organization not found"
        },{status : 404})
    }

    if(organization?.createdBy !== userid){
        return NextResponse.json({
            success : false,
            message : "User unauthorized"
        },{status : 400})
    }

    return NextResponse.json({
        success : true,
        message :"organization details fetched successfully",
        data : organization
    })
} catch (error) {

    console.error("Error in get organizatin admin controller")
    return NextResponse.json({
        success : false,
        message : "Internal Server Error"
    },{status:500})   
}
}


export const POST = async(req:NextRequest, {params}:{params:Promise<{id:number}>})=>{
    try {

        const {id} = await params

        const organizationId = Number(id)

        if(typeof(organizationId)!=="number" || !Number.isSafeInteger(organizationId)){
            return NextResponse.json({
                success : false,
                message : "Invalid organization id"
            },{status : 400})
        }

        const session = await getSession()

        if(!session){
            return NextResponse.json({
                success : false,
                message : "Unauthorized"
            },{status : 401})
        }

        const userId = session.user.id

        const organization = await db.query.OrganizationTable.findFirst({
            where : {
                id : organizationId
            },
            with : {
                organizationMember : true
            }
        })

        if(!organization){
            return NextResponse.json({
                success : false,
                message : "Organization not found"
            },{status : 404})
        }

        const organizationMember = organization.organizationMember.find((member)=> member.userId == userId)

        if(organization.createdBy != userId && organizationMember?.role !== "admin"){
            return NextResponse.json({
                success : false,
                message : "User not authenticated to create organization profile"
            },{status : 401})
        }

        const {
            website,
            about,
            contact1,
            contact2,
            addressLine1,
            addressLine2,
            city,
            state,
            country,
            instagram,
            facebook,
            youtube,
            twitter,
            linkedin
        } = await req.json()

        if(city || state || country){
            return NextResponse.json({
                success : false,
                message : "City, state, country are required"
            }, {status : 400})
        }

        



    } catch (error) {
        
    }
}

export const PATCH = async()=>{
    
}