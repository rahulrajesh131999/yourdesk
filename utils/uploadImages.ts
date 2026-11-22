import cloudinary from "@/lib/cloudinary"

/* export const uploadImageToCloudinary = async (
  file: File,
  folder: string,
  height?: number,
  quality?: number | "auto"
): Promise<{ secure_url: string; public_id: string } | null> => {
  try {
    const buffer = Buffer.from(await file.arrayBuffer());

    return await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder, resource_type: "auto", height, quality },
        (error, result) => {
          if (error) {
        reject(error);
        return;
    }
    if (!result?.secure_url || !result?.public_id) {
        reject(new Error("Cloudinary returned an invalid upload response"));
        return;
    }
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
}; */

type UploadOptions = {
  height?: number;
  width?: number;
  quality?: number | "auto";
};

export const uploadImageToCloudinary = async (
  file: File,
  folder: string,
  options: UploadOptions = {}
): Promise<{ secure_url: string; public_id: string } | null> => {
  try {
    const buffer = Buffer.from(await file.arrayBuffer());

    const { height, width, quality = "auto" } = options;

    return await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "image",
          transformation: {
            ...(height && { height }),
            ...(width && { width }),
            quality,
          },
        },
        (error, result) => {
          if (error) return reject(error);

          if (!result?.secure_url || !result?.public_id) {
            return reject(new Error("Invalid Cloudinary response"));
          }

          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
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


export const deleteImageFromCloudinary = async (publicId:string) =>{
  const result = await cloudinary.uploader.destroy(publicId, {
    resource_type:"image",
  })
  return result
}
