import { db } from "@/db/drizzle";
import { TicketImageTable, TicketTable } from "@/db/schema";
import { getSession } from "@/lib/auth-guard";
import {
  deleteImageFromCloudinary,
  uploadImageToCloudinary,
} from "@/utils/uploadImages";
import { and, eq, inArray } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// Get ticket by id

export const POST = async (
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) => {
  try {
    const { id } = await context.params;

    const ticketId = Number(id);

    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "User not logged in",
        },
        { status: 401 },
      );
    }
    const userId = session.user.id;

    const {organizationId} = await req.json();
    // const organizationId = Number(JSON.parse(organization));

    console.log("printing server organizationId", organizationId)

    if (!organizationId) {
      return NextResponse.json(
        {
          success: false,
          message: "organization not found",
        },
        { status: 404 },
      );
    }

    const ticket = await db.query.TicketTable.findFirst({
      where: {
        id: ticketId,
      },
      with: {
        organization: true,
        user: true,
        ticketAssigned: true,
        images: true,
      },
    });

    if (!ticket) {
      return NextResponse.json(
        {
          success: false,
          message: "Ticket not found",
        },
        { status: 404 },
      );
    }

    if (organizationId != ticket?.organizationId) {
      return NextResponse.json(
        {
          success: false,
          message: "Organization mismatch",
        },
        { status: 401 },
      );
    }

    const isAuthorized =
      userId === String(ticket.userId) ||
      userId === String(ticket.organization?.createdBy) ||
      ticket.ticketAssigned.some((agent) => String(agent.memberId) === userId);

    if (!isAuthorized) {
      return NextResponse.json(
        {
          success: false,
          message: "You are not authorized to access this ticket",
        },
        { status: 403 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Ticket fetched successfully",
        data: ticket,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error on fetching ticket");
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 },
    );
  }
};

// Update ticket with images

export const PATCH = async (
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) => {
  const UploadedImages: {
    url: string;
    publicId: string;
  }[] = [];

  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "User session not found",
        },
        { status: 401 },
      );
    }

    const userId = session.user.id;

    const { id } = await context.params;

    const ticketId = Number(id);

    if (!Number.isInteger(ticketId) || ticketId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid ticket ID",
        },
        { status: 400 },
      );
    }

    const existingTicket = await db.query.TicketTable.findFirst({
      where: {
        id: ticketId,
      },
    });

    if (!existingTicket || existingTicket.userId !== userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Ticket not found or unautorized user",
        },
        { status: 404 },
      );
    }

    const formData = await req.formData();

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const contact = formData.get("contact") as string;
    const ticketKind = formData.get("ticketKind") as string

    if (!name || !description) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing fileds in update ticket",
        },
        { status: 400 },
      );
    }

            const kind = ["issue","suggestion"]
    
            if(!kind.some((v)=> ticketKind == v)){
                return NextResponse.json({
                    success:false,
                    message : "Ticketkind issue"
                },{status : 400})
            }

    const removeImageIdsRaw = formData.get("removeImageIds");

    // formData.append("removeImageIds", JSON.stringify([1, 2, 3]));

    const images = formData.getAll("images");

    console.log("printing backend images", images)

    if (!images.every((img) => img instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid image files",
        },
        { status: 400 },
      );
    }

    const newImages = images.filter(
      (img): img is File => img instanceof File && img.size > 0,
    );

    console.log("printing new Images", newImages)

    const MAX_FILE_SIZE = 2 * 1024 * 1024;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

    if (
      newImages.some(
        (img) => !allowedTypes.includes(img.type) || img.size > MAX_FILE_SIZE,
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid image type or size",
        },
        { status: 400 },
      );
    }

    let removeImageIds: string[] = [];

    if (removeImageIdsRaw != null) {
      if (typeof removeImageIdsRaw !== "string") {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid image removal data",
          },
          { status: 400 },
        );
      }

      try {
        // possible error
        const parsed = JSON.parse(removeImageIdsRaw);

        if (
          !Array.isArray(parsed) ||
          !parsed.every((id) => typeof id === "string")
        ) {
          throw new Error("Invalid image IDs");
        }

        removeImageIds = [...new Set(parsed)];
      } catch (error) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid image ids 2",
          },
          { status: 400 },
        );
      }
    }

    const MAX_IMAGES = 5;

    const existingImages = await db
      .select({
        id: TicketImageTable.id,
      })
      .from(TicketImageTable)
      .where(eq(TicketImageTable.ticketId, ticketId));

    // const remainingImages = existingImages.length - removeImageIds.length;

    // find images that actually belong to this ticket

    let previousImages: {
      id: number;
      publicId: string;
    }[] = [];

    if (removeImageIds.length > 0) {
      previousImages = await db
        .select({
          id: TicketImageTable.id,
          publicId: TicketImageTable.publicId,
        })
        .from(TicketImageTable)
        .where(
          and(
            eq(TicketImageTable.ticketId, ticketId),
            inArray(TicketImageTable.url, removeImageIds),
          ),
        );

      // Prevent deleting images belonging to another ticket
      if (previousImages.length !== removeImageIds.length) {
        return NextResponse.json(
          {
            success: false,
            message: "One or more images not found",
          },
          { status: 400 },
        );
      }
    }

    const remainingImages = existingImages.length - previousImages.length;

     if (remainingImages + newImages.length > MAX_IMAGES) {
      return NextResponse.json(
        {
          success: false,
          message: "Maximum 5 images allowed",
        },
        { status: 400 },
      );
    }

    // upload new images to cloudinary

    for (const image of newImages) {
      const uploaded = await uploadImageToCloudinary(image, "yourdesk/ticket");
      if (!uploaded) {
        throw new Error("Cloudinary image upload failed");
      }
      UploadedImages.push({
        url: uploaded.secure_url,
        publicId: uploaded.public_id,
      });
    }

    // upload ticket and image records in one go

    const updatedTickets = await db.transaction(async (tx) => {
      const [ticket] = await tx
        .update(TicketTable)
        .set({
          name: name,
          description: description,
          contact: contact ?? existingTicket.contact,
          kind : ticketKind as "issue" | "suggestion"
        })
        .where(
          and(eq(TicketTable.id, ticketId), eq(TicketTable.userId, userId)),
        )
        .returning();

      if (!ticket) {
        throw new Error("Ticket not found");
      }

      // Remove selected image records
      if (removeImageIds.length > 0) {
        await tx
          .delete(TicketImageTable)
          .where(
            and(
              eq(TicketImageTable.ticketId, ticketId),
              inArray(TicketImageTable.url, removeImageIds),
            ),
          );
      }

      // Insert newly updated images
      if (UploadedImages.length > 0) {
        await tx.insert(TicketImageTable).values(
          UploadedImages.map((image) => ({
            url: image.url,
            publicId: image.publicId,
            ticketId,
          })),
        );
      }

      return ticket;
    });
    // database transaction succeeded
    // remove images from cloudinary
    const deletionResults = await Promise.allSettled(
      previousImages.map((img) => deleteImageFromCloudinary(img.publicId)),
    );

    deletionResults.forEach((results, index) => {
      if (results.status === "rejected") {
        console.error(
          "Cloudinary deletion failes: ",
          previousImages[index].id,
          results.reason,
        );
      }
    });

    return NextResponse.json(
      {
        success: true,
        message: "Ticket updated successfully",
        data : updatedTickets
      },
      { status: 200 },
    );

    /* const updatedTicket = await db.update(TicketTable).set({
          name : name,
          description :description,
          contact : contact
        }).where(eq(TicketTable.id, ticketId))

        for(const img of images){
          // const uploadedImages = await uploadImageToCloudinary("","")
        } */
  } catch (error) {
    console.error("PATCH Ticket error", error);

    // clean up new cloudinary uploads if the db operation failed
    await Promise.allSettled(
      UploadedImages.map((img) => {
        deleteImageFromCloudinary(img.publicId);
      }),
    );

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server error",
      },
      { status: 500 },
    );
  }
};

// Delete ticket

export const DELETE = async(req:NextRequest, context:{params : Promise<{id:string}>}) =>{

  try {
    const session = await getSession()

    if(!session){
      return NextResponse.json({
        success : false,
        message : "Session not found"
      }, {status:401})
    }

    const userId = session.user.id

    const {id} = await context.params

    if(!id){
      return NextResponse.json({
        success : false,
        message : "ticket id not recieved"
      })
    }

    const ticketId = Number(id)

    const ticket = await db.query.TicketTable.findFirst({
      where : {
        id : ticketId
      }
    })

    if(!ticket){
      return NextResponse.json({
        success : false,
        message : "Ticket not found"
      }, {status : 404})
    }

    if(ticket.userId !== userId){
      return NextResponse.json({
        success : false,
        message : "User not authorized to delete ticket"
      },{status : 401})
    }

    // delete image from cloudinary

    try {
      const ticketImages = await db.query.TicketImageTable.findMany({
        where : {
          ticketId :ticketId
        }
      })

      for(const img of ticketImages){
        const deletedTickets = await deleteImageFromCloudinary(img.publicId)
        console.log("images deleted from cloudinary", deletedTickets)
      }

    } catch (error) {
      console.log("failed to delete images from cloudinary", error)
      return NextResponse.json({
        success : false,
        message:"Failed to delete images from cloudinary"
      })
    }


    // delete ticket
    const deletedTicket = await db.transaction( async (tx)=>{
      await tx.delete(TicketTable).where(
        eq(TicketTable.id, ticketId)
      )

      await tx.delete(TicketImageTable).where(
        eq(TicketImageTable.ticketId , ticketId)
      )
    })

    return NextResponse.json({
      success : true,
      message : "Tickets deleted successfully"
    },{status : 200})



  } catch (error) {
    console.error("Failed to delete tickets", error)
    return NextResponse.json({
      success : false,
      message : "Internal Server Error"
    }, {status : 500})
  }

}
