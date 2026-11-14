import { db } from "@/db/drizzle"
import { TicketImageTable, TicketTable } from "@/db/schema"
import { getSession } from "@/lib/auth-guard"
import { uploadImageToCloudinary } from "@/utils/uploadImages"
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

        const userId = session.user.id

        const formData = await req.formData()
        const organizationId = req.json()

        const organization = Number(organizationId)

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

        
        const newTicket = await db.insert(TicketTable).values({
            name : name,
            description : description,
            userId : userId,
            organizationId :organization,
            contact : contact
        }).returning()

        const imageArray = []

        if(image.length > 0){
            for(const img of image){
                const uploadedImage = await uploadImageToCloudinary(img as File, "yourdesk/ticket")

                if(!uploadedImage?.secure_url){
                    return NextResponse.json({
                        success : false,
                        message : "Failed to upload image"
                    }, {status : 400})
                }
                imageArray.push(uploadedImage?.secure_url)

                const ticketImages = await db.insert(TicketImageTable).values({
                    url : uploadedImage.secure_url,
                    ticketId : newTicket[0].id,
                    publicId : uploadedImage.public_id 
                })
            }
        }

        return NextResponse.json({
            success : true,
            message : "Ticket created successfully",
            data : newTicket,
            images : imageArray
        }, {status : 200})



    } catch (error) {
        console.error("Error in Ticket creation", error)
        return NextResponse.json({
            success:false,
            message : "Internal Server Error"
        }, {status : 500})
    }
}