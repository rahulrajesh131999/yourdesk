import { getSession } from "@/lib/auth-guard";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { OrganizationTable, OrganizationMembersTable } from "@/db/schema";

import { eq } from "drizzle-orm";


// Get all organizations of the user

export const GET = async()=>{
  try {
    const session = await getSession()

    if(!session){
      return NextResponse.json({
        success : false,
        message : "Unauthorized"
      },{status:400})
    }

    const userId = session.user.id

    /* const userOrganization = await db.query.OrganizationTable.findMany({where : {
      createdBy : userId
    },
  with:{
    organizationMember : true,
    organizationTicket : true
  }}) */

    const userOrganization = await db.query.OrganizationMembersTable.findMany({where:{
      userId :userId
    },
  with:{
    organization : true,
    user : true,
    ticketAssignment : true
  }})

  if(!userOrganization){
    return NextResponse.json({
      success : false,
      message : "failed to fetch user organizations",
    }, {status : 400})
  }

  return NextResponse.json({
    success : true,
    message : "User organizations fetched successfully",
    data : userOrganization
  },{status:200})

  } catch (error) {
    console.error("Failed to get user organizations....", error)
    return NextResponse.json({
      success:false,
      message : "Internal Server Error"
    },{status:500})
  }
}

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

