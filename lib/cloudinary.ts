import {v2 as cloudinary} from "cloudinary"
import dotenv from "dotenv"

const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY
const cloudinaryApiSecret = process.env.CLOUDINARY_API_SECRET
const cloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME

if (!cloudinaryApiKey || !cloudinaryApiSecret || !cloudinaryCloudName) {
    throw new Error("Missing Cloudinary environment variables")
}

cloudinary.config({
    cloud_name : cloudinaryCloudName,
    api_key : cloudinaryApiKey,
    api_secret : cloudinaryApiSecret,
    secure : true
})

export default cloudinary