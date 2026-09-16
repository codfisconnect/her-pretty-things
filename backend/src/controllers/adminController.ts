import {
  createProduct,
  updateProduct,
  deactivateProduct,
} from '../services/productService.js'
import type { Request, Response } from 'express'
import { clearAdminSession, createAdminSession, isAdminSessionValid } from '../middleware/adminAuth.js'
import { HttpError } from '../middleware/errorHandler.js'
import { getDashboard, getOrder, listOrders, updateOrderStatus } from '../services/adminService.js'
import { uploadProductImage } from '../services/cloudinaryService.js'

function readString(value: unknown, field: string) {
  if (typeof value !== 'string' || value.trim().length === 0) throw new HttpError(400, `${field} is required.`)
  return value.trim()
}

export function adminLogin(request: Request, response: Response) {
  const body = request.body as unknown
  if (typeof body !== 'object' || body === null) throw new HttpError(400, 'Login payload is required.')
  const record = body as Record<string, unknown>
  const email = readString(record.email, 'email')
  const password = readString(record.password, 'password')
  const configuredEmail = process.env.ADMIN_EMAIL
  const configuredPassword = process.env.ADMIN_PASSWORD
  if (!configuredEmail || !configuredPassword) throw new HttpError(500, 'Admin credentials are not configured.')
  if (email !== configuredEmail || password !== configuredPassword) throw new HttpError(401, 'Invalid admin credentials.')
  createAdminSession(response)
  response.json({ success: true, data: { email } })
}

export function adminLogout(_request: Request, response: Response) {
  clearAdminSession(response)
  response.json({ success: true })
}

export function adminSession(request: Request, response: Response) {
  response.json({ success: true, data: { authenticated: isAdminSessionValid(request) } })
}

export async function dashboard(_request: Request, response: Response) { response.json({ success: true, data: await getDashboard() }) }
export async function orders(_request: Request, response: Response) { response.json({ success: true, data: await listOrders() }) }

export async function orderDetails(request: Request, response: Response) {
  response.json({ success: true, data: await getOrder(readString(request.params.orderId, 'orderId')) })
}

export async function orderStatus(request: Request, response: Response) {
  const body = request.body as unknown
  if (typeof body !== 'object' || body === null) throw new HttpError(400, 'Status payload is required.')
  response.json({ success: true, data: await updateOrderStatus(readString(request.params.orderId, 'orderId'), readString((body as Record<string, unknown>).status, 'status')) })
}

export async function createAdminProduct(
  request: Request,
  response: Response,
) {
  const body = request.body as unknown

  if (typeof body !== 'object' || body === null) {
    throw new HttpError(400, 'Product payload is required.')
  }

  const record = body as Record<string, unknown>

  const uploadedImages =
    request.files as Express.Multer.File[] | undefined

  const imageUrls: string[] = []

  if (uploadedImages && uploadedImages.length > 0) {
    for (const uploadedImage of uploadedImages) {
      const cloudinaryResult = await uploadProductImage(
        uploadedImage.buffer,
        uploadedImage.originalname,
      )

      imageUrls.push(cloudinaryResult.secure_url)
    }
  }

  const product = await createProduct({
    name: record.name as string,
    category: record.category as string,
    price: Number(record.price),
    description: record.description as string | undefined,
    stock:
      record.stock !== undefined
        ? Number(record.stock)
        : undefined,
    images: imageUrls,
  })

  response.status(201).json({
    success: true,
    data: product,
    uploadedImages: uploadedImages
      ? uploadedImages.map((image, index) => ({
          originalName: image.originalname,
          size: image.size,
          mimetype: image.mimetype,
          url: imageUrls[index],
        }))
      : [],
  })
}

export async function updateAdminProduct(
  request: Request,
  response: Response,
) {
  const productId = readString(request.params.productId, 'productId')

  const body = request.body as unknown

  if (typeof body !== 'object' || body === null) {
    throw new HttpError(400, 'Product payload is required.')
  }

  const record = body as Record<string, unknown>

  const product = await updateProduct(productId, {
    name: record.name as string | undefined,
    category: record.category as string | undefined,
    price: record.price !== undefined ? Number(record.price) : undefined,
    description:
      record.description !== undefined
        ? (record.description as string)
        : undefined,
    stock: record.stock !== undefined ? Number(record.stock) : undefined,
    images:
  Array.isArray(record.images)
    ? (record.images as string[])
    : undefined,
    active:
      record.active !== undefined
        ? Boolean(record.active)
        : undefined,
  })

  response.json({
    success: true,
    data: product,
  })
}

export async function deactivateAdminProduct(
  request: Request,
  response: Response,
) {
  const productId = readString(request.params.productId, 'productId')

  const product = await deactivateProduct(productId)

  response.json({
    success: true,
    data: product,
  })
}