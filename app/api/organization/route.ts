import { getSession } from "@/lib/auth-guard";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { OrganizationTable, OrganizationMembersTable } from "@/db/schema";

import { eq } from "drizzle-orm";

// Create organization

export const POST = async (req: NextRequest) => {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorised",
        },
        { status: 401 },
      );
    }

    const formData = await req.formData();

    const name = formData.get("name");
    const slug = formData.get("slug");

    if (
      typeof name !== "string" ||
      typeof slug !== "string" ||
      !name.trim() ||
      !slug.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing or invalid fields",
        },
        { status: 400 },
      );
    }

    const existingSlug = await db
    .select()
    .from(OrganizationTable)
    .where(eq(OrganizationTable.slug, slug))
    .limit(1)

    if (existingSlug.length > 0) {
    return NextResponse.json({
        success: false,
        message: "Organization slug already exists"
    }, { status: 409 });
}

    const userId = session.user.id;

    const newOrganization = await db
      .insert(OrganizationTable)
      .values({
        name: name,
        slug: slug,
        createdBy: userId,
      })
      .returning();

      const addOwner = await db
                            .insert(OrganizationMembersTable)
                            .values({
                                organizationId : newOrganization[0].id,
                                userId : userId,
                                role : "owner"
                            }).returning()
    if(!addOwner){
        return NextResponse.json({
            success : false,
            message : "Failed to add user as owner in OrganizationMenbersTable"
        },{status : 402})
    }

    return NextResponse.json(
      {
        success: true,
        message: "New organization created",
        data: newOrganization,
        membersData : addOwner
      },
      { status: 200 },
    );

    // add the user as the owner of the organization

    
  } catch (error) {
    console.log("Error in CREATE ORGANIZATION", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 },
    );
  }
};

// Update organization

export const PUT = async(req:NextRequest) =>{
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

    const {organizationId, name, slug } = await req.json()

    if(!organizationId || !name || !slug){
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
                                        .set({name:name, slug:slug})
                                        .where(eq(OrganizationTable.id, organization.id))
                                        .returning()

    if(!updatedOrganization){
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

export const DELETE = async(req:NextRequest) =>{
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

    const {organizationId } = await req.json()

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
