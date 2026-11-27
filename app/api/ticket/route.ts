import { db } from "@/db/drizzle"
import { TicketImageTable, TicketTable } from "@/db/schema"
import { getSession } from "@/lib/auth-guard"
import { deleteImageFromCloudinary, uploadImageToCloudinary } from "@/utils/uploadImages"
import { NextRequest, NextResponse } from "next/server"


// get ticket by organization
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
        const session = await getSession()

        if(!session){
            return NextResponse.json({
                success : false,
                message : "User not logged in"
            }, {status : 400})
        }

        const MAX_IMAGE_SIZE = 2 * 1024 * 1024 // 5MB
        const MAX_IMAGE = 5

        const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

        const userId = session.user.id

        const formData = await req.formData()
        const organizationId = formData.get("organizationId") 

        if (
    typeof organizationId !== "string" ||
    !organizationId.trim() ||
    !Number.isInteger(Number(organizationId))
) {
    return NextResponse.json({
        success: false,
        message: "Invalid organization ID"
    }, { status: 400 })
}

    type ticketKind = "issue" | "suggestion"


        const organization = Number(organizationId)

        const name = formData.get("name") as string
        const description = formData.get("description") as string
        const contact = formData.get("contact") as string
        const ticketKind = formData.get("ticketKind") as ticketKind

        if (
            typeof name !== "string" ||
            !name.trim() ||
            typeof description !== "string" ||
            !description.trim()
        ) {
            return NextResponse.json({
                success: false,
                message: "Name and description required"
            }, { status: 400 })
        }

        if (contact !== null && typeof contact !== "string") {
            return NextResponse.json({
                success: false,
                message: "Invalid contact"
            }, { status: 400 })
        }

        const kind = ["issue","suggestion"]

        if(!kind.some((v)=> ticketKind == v)){
            return NextResponse.json({
                success:false,
                message : "Ticketkind issue"
            },{status : 400})
        }

        const image = formData.getAll("images")

        if(image.length > MAX_IMAGE){
            return NextResponse.json({
                success : false,
                message : "Image length exceeded"
            },{status:400})
        }

            const validImages = image.filter(
    (img): img is File => img instanceof File && img.size > 0
)

        if (
      validImages.some(
        (img) => !allowedTypes.includes(img.type) || img.size > MAX_IMAGE_SIZE,
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

    


if(image && image.length != validImages.length){
    return NextResponse.json({
        success: false,
        message : "image and validated image doesnt match"
    },{status : 400})
}
const uploadedImages:any[] = []

    try {
        for(const img of validImages){
            const uploaded = await uploadImageToCloudinary(img, "yourdesk/ticket")
            if(!uploaded){
                throw new Error("Image upload failed")
            }
            uploadedImages.push(uploaded)
        }

 /*        const uploadedImages = await Promise.all(
    validImages.map(img =>
        uploadImageToCloudinary(img, "yourdesk/ticket")
    )
) */

        // database transaction

        const result = await db.transaction(async (tx)=>{
            const [ticket] = await tx.insert(TicketTable).values({
                name,
                description,
                userId,
                organizationId: organization,
                contact,
                kind : ticketKind 
            }).returning()

            if(uploadedImages.length>0){
                await tx.insert(TicketImageTable).values(
                    uploadedImages.map((img)=>({
                        url: img.secure_url,
                    ticketId: ticket.id,
                    publicId: img.public_id
                    }))
                )
            }
            return ticket
        })

        return NextResponse.json({
        success: true,
        message: "Ticket created successfully",
        data: result,
        images: uploadedImages.map(img => img.secure_url)
    })
    } catch (error) {

        console.error("error entering values to database", error)

         const cleanupResults = await Promise.allSettled(
                uploadedImages.map(img =>
                    deleteImageFromCloudinary(img.public_id)
                )
            )

            cleanupResults.forEach((result) => {
                if (result.status === "rejected") {
                    console.error(
                        "Cloudinary cleanup failed:",
                        result.reason
                    )
                }
            })

        return NextResponse.json({
            success : false,
            message : "failed to enter values to database"
        },{status:500})

        
    }
    } catch (error) {
        console.error("Error in Ticket creation", error)
        return NextResponse.json({
            success:false,
            message : "Internal Server Error"
        }, {status : 500})
    }
}