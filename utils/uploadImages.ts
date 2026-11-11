import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

export const uploadImageToCloudinary = async (
  file: File,
  folder: string,
  height?: number,
  quality?: number
): Promise<{ secure_url: string; public_id: string } | null> => {
  try {
    const buffer = Buffer.from(await file.arrayBuffer());

    return await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder, resource_type: "auto", height, quality },
        (error, result) => {
          if (error) reject(error);
          else resolve({
            secure_url: result?.secure_url!,
            public_id: result?.public_id!,
          });
        }
      );
      uploadStream.end(buffer);
    });
  } catch (err) {
    console.error("Cloudinary upload failed:", err);
    return null;
  }
};
