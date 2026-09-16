import { UploadApiResponse } from 'cloudinary'
import cloudinary from '../config/cloudinary.js'

export async function uploadProductImage(
  buffer: Buffer,
  originalName: string,
): Promise<UploadApiResponse> {
  const extension = originalName.split('.').pop()?.toLowerCase() ?? 'jpg'

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'her-pretty-things/products',
        resource_type: 'image',
        format: extension,
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error('Cloudinary image upload failed.'))
          return
        }

        resolve(result)
      },
    )

    uploadStream.end(buffer)
  })
}