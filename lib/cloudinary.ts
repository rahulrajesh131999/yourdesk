import {v2 as cloudinary} from "cloudinary"

cloudinary.config({
    cloud_name : "cloudname",
    api_key : "",
    api_secret : "",
    secure : true
})

export default cloudinary