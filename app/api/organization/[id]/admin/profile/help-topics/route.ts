import { db } from "@/db/drizzle"
import { OrganizationHelpTopics } from "@/db/schema"
import { getSession } from "@/lib/auth-guard"
import { success } from "better-auth"
import { and, eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

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

export const POST = async(req:NextRequest,{params}:{params : Promise<{id:string}>})=>{

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

    if(!organizationId || !Number.isSafeInteger(organizationId)){
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

    const userIsAdmin = organization.organizationMember.some((member)=>member.userId === userId && member.role == "admin")

    if(userId != organization.createdBy && !userIsAdmin){
        return NextResponse.json({
            success : false,
            message : "User not authorized for edit organization help topics"
        },{status : 401})
    }

    const {helptopics } = await req.json()
    
    if(!helptopics || !Array.isArray(helptopics) || helptopics.length === 0){
        return NextResponse.json({
            success : false,
            message : "At least one help topic is required"
        },{status : 400})
    }

    if (helptopics.length > 50) {
  return NextResponse.json({
    success: false,
    message: "Maximum 50 help topics per request"
  }, { status: 400 });
}

const validTopics = helptopics.every(
  (topic) =>
    typeof topic.question === "string" &&
    topic.question.trim().length > 0 &&
    typeof topic.answer === "string" &&
    topic.answer.trim().length > 0
);

if (!validTopics) {
  return NextResponse.json({
    success: false,
    message: "Every topic must have a question and answer"
  }, { status: 400 });
}


    const newHelpTopics = await db.insert(OrganizationHelpTopics).values(
        helptopics.map((v: {question : string, answer:string})=>({
            question : v.question,
            answer : v.answer,
            organizatonId: organizationId
        }))
    ).returning()

    if(!newHelpTopics){
        return NextResponse.json({
            success : false,
            message : "Failed to create new help topic"
        },{status : 400})
    }

    return NextResponse.json({
        success : true,
        message : "New help topic created",
        data : helptopics
    },{status:200})
        
    } catch (error) {

        console.error("Error in CREATING help topics", error)
        return NextResponse.json({
            success : false,
            message : "Internal Server Error"
        },{status:500})
        
    }

}

export const PATCH = async(req:NextRequest,{params}:{params : Promise<{id:string}>})=>{

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
            organizationMember : true
        }
    })

    if(!organization){
        return NextResponse.json({
            success : false,
            message : "organization or helptopics not found"
        })
    }
    // user authorization checking

    const userIsAdmin = organization.organizationMember.some((member)=>member.userId === userId && member.role == "admin")

    if(userId != organization.createdBy && !userIsAdmin){
        return NextResponse.json({
            success : false,
            message : "User not authorized for edit organization help topics"
        },{status : 401})
    }

    const {question, answer, helptopicId } = await req.json()

    if(!helptopicId){
        return NextResponse.json({
            success : false,
            message : "Help topic id missing"
        },{status : 400})
    }
    
    if(!question || !answer){
        return NextResponse.json({
            success : false,
            message : "Both question and answer are required"
        },{status : 400})
    }

    const existingHelpTopic = await db.query.OrganizationHelpTopics.findFirst({
        where : {
            id : helptopicId
        }
    })

    if(!existingHelpTopic){
        return NextResponse.json({
            success : false,
            message : `helptopic of id ${helptopicId} is not found`
        },{status : 404})
    }

    if(existingHelpTopic.organizatonId !== organization.id){
        return NextResponse.json({
            success : false,
            message : "helptopic doesnot belong to organization"
        },{status : 400})
    }

    const helpTopic = await db.update(OrganizationHelpTopics).set({
        question : question,
        answer : answer,
        organizatonId : organizationId
    }).where(
        and(
            eq(OrganizationHelpTopics.id, helptopicId),
            eq(OrganizationHelpTopics.organizatonId, organizationId)
        )
    ).returning()


    if(!helpTopic){
        return NextResponse.json({
            success : false,
            message : "Failed to update help topic"
        },{status : 400})
    }

    return NextResponse.json({
        success : true,
        message : "help topic updated",
        data : helpTopic
    },{status:200})
        
    } catch (error) {

        console.error("Error in UPDATING help topics", error)
        return NextResponse.json({
            success : false,
            message : "Internal Server Error"
        },{status:500})
        
    }

}
export const DELETE = async(req:NextRequest,{params}:{params : Promise<{id:string}>})=>{

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
            organizationMember : true
        }
    })

    if(!organization ){
        return NextResponse.json({
            success : false,
            message : "organization or helptopics not found"
        })
    }
    // user authorization checking

    const userIsAdmin = organization.organizationMember.some((member)=>member.userId === userId && member.role == "admin")

    if(userId != organization.createdBy && !userIsAdmin){
        return NextResponse.json({
            success : false,
            message : "User not authorized for delete organization help topics"
        },{status : 401})
    }

    const { helptopicId } = await req.json()

    if(!helptopicId){
        return NextResponse.json({
            success : false,
            message : "Help topic id missing"
        },{status : 400})
    }
    

    const existingHelpTopic = await db.query.OrganizationHelpTopics.findFirst({
        where : {
            id : helptopicId
        }
    })

    if(!existingHelpTopic){
        return NextResponse.json({
            success : false,
            message : `helptopic of id ${helptopicId} is not found`
        },{status : 404})
    }

    if(existingHelpTopic.organizatonId !== organization.id){
        return NextResponse.json({
            success : false,
            message : "helptopic doesnot belong to organization"
        },{status : 400})
    }

    await db.delete(OrganizationHelpTopics).where(
        and(
            eq(OrganizationHelpTopics.id, helptopicId),
            eq(OrganizationHelpTopics.organizatonId, organizationId)

        )
    )

    return NextResponse.json({
        success : true,
        message : "help topic deleted",
    },{status:200})
        
    } catch (error) {

        console.error("Error in UPDATING help topics", error)
        return NextResponse.json({
            success : false,
            message : "Internal Server Error"
        },{status:500})
        
    }

}