import { db } from "@/db/drizzle";
import { OrganizationTable } from "@/db/schema";
import { getSession } from "@/lib/auth-guard";
import { eq } from "drizzle-orm";
import { date } from "drizzle-orm/pg-core";
import { NextRequest, NextResponse } from "next/server";

export const GET = async(req:NextRequest, context : {params:Promise<{id:string}>}) =>{
    try {
        const {id} = await context.params 

        const organizationId = Number(id)

        const organization = await db.query.OrganizationTable.findFirst({where :{
            id : organizationId
        }})

        if(!organization){
            return NextResponse.json({
                success : false,
                message : `Organization not found with organization id ${id}`
            },{status : 404})
        }

        return NextResponse.json({
            success : true,
            message : "Organization fetched",
            data:organization
        },{status : 200})
    } catch (error) {
        console.error("Failed to fetch organization with id")
        return NextResponse.json({
            success : false,
            message : "Internal Server Error"
        },{status:500})
    }
}


// Update organization

export const PUT = async(req:NextRequest, context:{params : Promise<{id:string}>}) =>{
    try {
        
        const session = await getSession()

        if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorised",
        },
        { status: 401 },
      );
    }

    const userId = session.user.id

    const {id} = await context.params

    const organizationId = Number(id)

if (!Number.isInteger(organizationId) || organizationId <= 0) {
    return NextResponse.json({
        success: false,
        message: "Invalid organization ID"
    }, { status: 400 });
}

    console.log("printing organizationId", organizationId)

    const formdata = await  req.formData()

    const name = formdata.get("name") as string
    const slug = formdata.get("slug") as string

    console.log("printing name and slug", name, slug)

    if( !name || !slug){
        return NextResponse.json({
            success : false,
            message : "Missing fields"
        },{status:401})
    }

/*     const [organization] = await db
                                .select()
                                .from(OrganizationTable)
                                .where(eq(OrganizationTable.id, organizationId))
                                .limit(1) */

    const organization = await db.query.OrganizationTable.findFirst({
        where :  {id : organizationId}
    })

    if(!organization){
        return NextResponse.json({
            succcess : false,
            message : "Organization not found"
        }, {status:404})
    }

    if(userId != organization.createdBy){
        return NextResponse.json({
            success : false,
            message : "User has no authority updating the organization"
        },{status:401})
    }

    const updatedOrganization = await db
                                        .update(OrganizationTable)
                                        .set({name:name, slug:slug })
                                        .where(eq(OrganizationTable.id, organization.id))
                                        .returning()

    if(updatedOrganization.length == 0){
        return NextResponse.json({
            success : false,
            message : "Failed to update organization"
        }, {status:401})
    }

    return NextResponse.json({
        success : true,
        message : "Organization updated successfully"
    }, {status : 200})

    } catch (error) {
        console.error("Error in updating OrganizationTable", error)
        return NextResponse.json({
            success : false,
            message : "Internal Server Error"
        },{status:500})
    }
}

// Delete organization

export const DELETE = async(req:NextRequest, context : {params:Promise<{id:string}>}) =>{
    try {
        
         const session = await getSession()

        if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorised",
        },
        { status: 401 },
      );
    }

    const userId = session.user.id

    const {id } = await context.params

    const organizationId = Number(id)

    if(!organizationId){
        return NextResponse.json({
            success : false,
            message : "missing fields"
        },{status:401})
    }

    const organization = await db.query.OrganizationTable.findFirst({
        where :  {id : organizationId}
    })

    if(!organization){
        return NextResponse.json({
            succcess : false,
            message : "Organization not found"
        }, {status:404})
    }

    if(userId != organization.createdBy){
        return NextResponse.json({
            success : false,
            message : "User has no authority updating the organization"
        },{status:401})
    }

    const deletedOrganization = await db.delete(OrganizationTable).where(eq(OrganizationTable.id, organization.id))

    if(!deletedOrganization){
        return NextResponse.json({
            success:false,
            message : "Failed to delete Organization"
        },{status:400})
    }

    return NextResponse.json({
        success : true,
        message : "Organization deleted successfully"
    })

    } catch (error) {
        console.error("Error deleting OrganizationTable", error)
        return NextResponse.json({
            success : false,
            message : "Internal Server Error"
        },{status : 500})
    }
}
