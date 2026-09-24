import { UploadApiResponse } from "cloudinary";
import cloudinary from "../config/cloudinary.js";

export async function uploadProductImage(
  buffer: Buffer,
  originalName: string,
): Promise<UploadApiResponse> {
  const extension = originalName.split(".").pop()?.toLowerCase() ?? "jpg";

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "her-pretty-things/products",
        resource_type: "image",
        format: extension,
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary image upload failed."));
          return;
        }

        resolve(result);
      },
    );

    uploadStream.end(buffer);
  });
}

export async function deleteProductImage(imageUrl: string): Promise<void> {
  const url = new URL(imageUrl);
  const uploadIndex = url.pathname.indexOf("/upload/");

  if (uploadIndex === -1) {
    throw new Error("Invalid Cloudinary image URL.");
  }

  let publicId = url.pathname.substring(uploadIndex + "/upload/".length);

  // Remove Cloudinary version, e.g. v1789554013/
  publicId = publicId.replace(/^v\d+\//, "");

  // Remove file extension
  publicId = publicId.replace(/\.[^/.]+$/, "");

  await cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
  });
}
