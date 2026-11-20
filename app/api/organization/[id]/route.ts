import { db } from "@/db/drizzle";
import { OrganizationTable } from "@/db/schema";
import { getSession } from "@/lib/auth-guard";
import { deleteImageFromCloudinary, uploadImageToCloudinary } from "@/utils/uploadImages";
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

export const PATCH = async(req:NextRequest, context:{params : Promise<{id:string}>}) =>{
    let uploadedImagePublicId: string | undefined;
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

    const nameValue = formdata.get("name") as string
    const slugValue = formdata.get("slug") as string
    const industryValue = formdata.get("industry") as string
    const imageValue = formdata.get("image") as File
    const imageRemove = formdata.get("imageRemove") === "false"

    console.log("printing name and slug", nameValue, slugValue, industryValue)

    if( !nameValue || !slugValue || !industryValue){
        return NextResponse.json({
            success : false,
            message : "Missing fields"
        },{status:401})
    }

    const name = nameValue.trim()
    const slug = slugValue.trim()
    const industry = industryValue.trim()

    const image =
      imageValue instanceof File && imageValue.size > 0
        ? imageValue
        : null;

    if (imageValue !== null  && !image) {
      return NextResponse.json(
        { success: false, message: "Invalid image" },
        { status: 400 }
      );
    }

    if (image && !image.type.startsWith("image/")) {
      return NextResponse.json(
        { success: false, message: "Only image files are allowed" },
        { status: 400 }
      );
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
        },{status:403})
    }

    const existingOrganization = await db.query.OrganizationTable.findFirst({
        where : {slug : slug}
    })

if (
    existingOrganization &&
    existingOrganization.id !== organizationId
) {
    return NextResponse.json({
        success: false,
        message: "Slug already exists"
    }, { status: 409 });
}

    const oldImagePublicId = organization.image
    let newImagePublicId = oldImagePublicId

    if(image){
        const imageUpload = await uploadImageToCloudinary(
        image,
        "yourdesk/organization"
      );

      if (!imageUpload?.public_id) {
        return NextResponse.json(
          { success: false, message: "Image upload failed" },
          { status: 500 }
        );
      }
      uploadedImagePublicId = imageUpload.public_id
      newImagePublicId = imageUpload.public_id
    }else if(imageRemove){
        newImagePublicId = null
    }

    // update database

    const updatedOrganization = await db
                                        .update(OrganizationTable)
                                        .set({name:name, slug:slug,industry:industry, image:newImagePublicId})
                                        .where(eq(OrganizationTable.id, organization.id))
                                        .returning()

    if(!updatedOrganization){
        return NextResponse.json({
            success : false,
            message : "Failed to update organization"
        }, {status:401})
    }

    // delete old image only after success database update

    if(oldImagePublicId && oldImagePublicId!== newImagePublicId){
        try {
            await deleteImageFromCloudinary(oldImagePublicId)
        } catch (error) {
            console.error("Failed to delete old Cloudinary image:", error);
        }
    }

    return NextResponse.json({
        success : true,
        message : "Organization updated successfully"
    }, {status : 200})

    } catch (error) {
        console.error("Error in updating OrganizationTable", error)
        // clean up newly uploaded image if database updation failed
        if(uploadedImagePublicId){
            try {
                await deleteImageFromCloudinary(uploadedImagePublicId)
            } catch (error) {
                console.error("Failed to delete newly uploaded Cloudinary image:", error);
            }
        }
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
