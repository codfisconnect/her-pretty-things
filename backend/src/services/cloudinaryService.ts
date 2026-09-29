import { UploadApiResponse } from 'cloudinary'
import cloudinary, { isCloudinaryConfigured } from '../config/cloudinary.js'

export async function uploadProductImage(
  buffer: Buffer,
  originalName: string,
): Promise<UploadApiResponse> {
  const extension = originalName.split('.').pop()?.toLowerCase() ?? 'webp'

  if (!isCloudinaryConfigured()) {
    // Development fallback when Cloudinary credentials are not set
    const base64 = buffer.toString('base64')
    const mime = extension === 'png' ? 'image/png' : extension === 'webp' ? 'image/webp' : 'image/jpeg'
    const dataUri = `data:${mime};base64,${base64}`

    return {
      secure_url: dataUri,
      url: dataUri,
      public_id: `dev-${Date.now()}`,
      version: 1,
      width: 800,
      height: 800,
      format: extension,
      resource_type: 'image',
      created_at: new Date().toISOString(),
      bytes: buffer.length,
      type: 'upload',
      etag: 'dev',
      placeholder: false,
    } as UploadApiResponse
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'her-pretty-things/products',
        resource_type: 'image',
        format: extension === 'png' ? 'png' : 'webp',
        transformation: [
          { quality: 'auto', fetch_format: 'auto' },
        ],
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

export async function deleteProductImage(imageUrl: string): Promise<void> {
  if (!imageUrl || imageUrl.startsWith('data:') || !isCloudinaryConfigured()) {
    return
  }

  try {
    const url = new URL(imageUrl)
    const uploadIndex = url.pathname.indexOf('/upload/')

    if (uploadIndex === -1) {
      return
    }

    let publicId = url.pathname.substring(uploadIndex + '/upload/'.length)

    // Remove Cloudinary version, e.g. v1789554013/
    publicId = publicId.replace(/^v\d+\//, '')

    // Remove file extension
    publicId = publicId.replace(/\.[^/.]+$/, '')

    await cloudinary.uploader.destroy(publicId, {
      resource_type: 'image',
    })
  } catch (err) {
    console.error('Failed to delete image from Cloudinary:', err)
  }
}
