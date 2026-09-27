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
import {
  listSeasonalGreetings,
  createSeasonalGreeting,
  updateSeasonalGreeting,
  deleteSeasonalGreeting,
} from '../services/seasonalGreetingService.js'
import { getByobSettings, updateByobSettings } from '../services/byobService.js'
import { listAllRewards } from '../services/gameService.js'
import { getBusinessInfo, updateBusinessInfo, listDamageClaims, updateDamageClaimStatus } from '../services/businessService.js'

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
  const configuredEmail = (process.env.ADMIN_EMAIL || 'admin@example.com').trim().replace(/^["']|["']$/g, '')
  const configuredPassword = (process.env.ADMIN_PASSWORD || 'admin123').trim().replace(/^["']|["']$/g, '')

  const emailMatches = email.trim().toLowerCase() === configuredEmail.toLowerCase()
  const passwordMatches = password === configuredPassword

  if (!emailMatches || !passwordMatches) {
    throw new HttpError(401, 'Invalid admin credentials.')
  }
  createAdminSession(response, request)
  response.json({ success: true, data: { email: configuredEmail } })
}

export function adminLogout(request: Request, response: Response) {
  clearAdminSession(response, request)
  response.json({ success: true })
}

export function adminSession(request: Request, response: Response) {
  response.json({ success: true, data: { authenticated: isAdminSessionValid(request) } })
}

export async function dashboard(_request: Request, response: Response) {
  response.json({ success: true, data: await getDashboard() })
}

export async function orders(request: Request, response: Response) {
  const status = typeof request.query.status === 'string' ? request.query.status : undefined
  const paymentStatus = typeof request.query.paymentStatus === 'string' ? request.query.paymentStatus : undefined
  const search = typeof request.query.search === 'string' ? request.query.search : undefined
  response.json({ success: true, data: await listOrders({ status, paymentStatus, search }) })
}

export async function orderDetails(request: Request, response: Response) {
  response.json({ success: true, data: await getOrder(readString(request.params.orderId, 'orderId')) })
}

export async function orderStatus(request: Request, response: Response) {
  const body = request.body as unknown
  if (typeof body !== 'object' || body === null) throw new HttpError(400, 'Status payload is required.')
  response.json({
    success: true,
    data: await updateOrderStatus(readString(request.params.orderId, 'orderId'), readString((body as Record<string, unknown>).status, 'status')),
  })
}

export async function createAdminProduct(request: Request, response: Response) {
  const body = request.body as unknown
  if (typeof body !== 'object' || body === null) throw new HttpError(400, 'Product payload is required.')
  const record = body as Record<string, unknown>

  const uploadedImages = request.files as Express.Multer.File[] | undefined
  const imageUrls: string[] = []

  if (uploadedImages && uploadedImages.length > 0) {
    for (const uploadedImage of uploadedImages) {
      const cloudinaryResult = await uploadProductImage(uploadedImage.buffer, uploadedImage.originalname)
      imageUrls.push(cloudinaryResult.secure_url)
    }
  }

  // Also support passed existing imageUrls
  if (record.imageUrls) {
    const urls = Array.isArray(record.imageUrls) ? record.imageUrls : [record.imageUrls]
    for (const u of urls) {
      if (typeof u === 'string' && u.trim().length > 0 && !imageUrls.includes(u.trim())) {
        imageUrls.push(u.trim())
      }
    }
  }

  const product = await createProduct({
    name: readString(record.name, 'name'),
    category: readString(record.category, 'category'),
    price: Number(record.price),
    mrp: record.mrp !== undefined && record.mrp !== '' ? Number(record.mrp) : undefined,
    sku: typeof record.sku === 'string' ? record.sku.trim() : undefined,
    byobEligible: record.byobEligible !== undefined
      ? (record.byobEligible === true || record.byobEligible === 'true')
      : (['jewellery', 'jewelry', 'kawaii'].includes(readString(record.category, 'category').trim().toLowerCase())),
    description: typeof record.description === 'string' ? record.description.trim() : undefined,
    images: imageUrls,
  })

  response.status(201).json({
    success: true,
    data: product,
  })
}

export async function updateAdminProduct(request: Request, response: Response) {
  const productId = readString(request.params.productId, 'productId')
  const body = request.body as unknown
  if (typeof body !== 'object' || body === null) throw new HttpError(400, 'Product payload is required.')
  const record = body as Record<string, unknown>

  const uploadedImages = request.files as Express.Multer.File[] | undefined
  const newUploadedUrls: string[] = []

  if (uploadedImages && uploadedImages.length > 0) {
    for (const uploadedImage of uploadedImages) {
      const cloudinaryResult = await uploadProductImage(uploadedImage.buffer, uploadedImage.originalname)
      newUploadedUrls.push(cloudinaryResult.secure_url)
    }
  }

  let finalImages: string[] | undefined
  if (record.images !== undefined || newUploadedUrls.length > 0) {
    const existing = Array.isArray(record.images)
      ? record.images
      : typeof record.images === 'string' && record.images.length > 0
      ? [record.images]
      : []
    finalImages = [...existing, ...newUploadedUrls]
  }

  const product = await updateProduct(productId, {
    name: record.name !== undefined ? (record.name as string) : undefined,
    category: record.category !== undefined ? (record.category as string) : undefined,
    price: record.price !== undefined ? Number(record.price) : undefined,
    mrp: record.mrp !== undefined && record.mrp !== '' ? Number(record.mrp) : undefined,
    sku: record.sku !== undefined ? (record.sku as string) : undefined,
    description: record.description !== undefined ? (record.description as string) : undefined,
    stock: record.stock !== undefined ? Number(record.stock) : undefined,
    byobEligible: record.byobEligible !== undefined ? (record.byobEligible === true || record.byobEligible === 'true') : undefined,
    images: finalImages,
    active: record.active !== undefined ? Boolean(record.active) : undefined,
  })

  response.json({
    success: true,
    data: product,
  })
}

export async function deactivateAdminProduct(request: Request, response: Response) {
  const productId = readString(request.params.productId, 'productId')
  const product = await deactivateProduct(productId)
  response.json({ success: true, data: product })
}

export async function uploadAdminScoopImage(request: Request, response: Response) {
  if (!request.file) throw new HttpError(400, 'Image file is required.')
  const result = await uploadProductImage(request.file.buffer, request.file.originalname)
  response.json({ success: true, data: { url: result.secure_url } })
}

// Seasonal Character Greetings Admin
export async function getGreetingsAdmin(_request: Request, response: Response) {
  response.json({ success: true, data: await listSeasonalGreetings() })
}

export async function createGreetingAdmin(request: Request, response: Response) {
  let characterImage = typeof request.body?.characterImage === 'string' ? request.body.characterImage : ''
  if (request.file) {
    const uploadResult = await uploadProductImage(request.file.buffer, request.file.originalname)
    characterImage = uploadResult.secure_url
  }

  const greeting = await createSeasonalGreeting({
    ...request.body,
    characterImage,
  })
  response.status(201).json({ success: true, data: greeting })
}

export async function updateGreetingAdmin(request: Request, response: Response) {
  const id = readString(request.params.id, 'id')
  let characterImage = typeof request.body?.characterImage === 'string' ? request.body.characterImage : undefined
  if (request.file) {
    const uploadResult = await uploadProductImage(request.file.buffer, request.file.originalname)
    characterImage = uploadResult.secure_url
  }

  const greeting = await updateSeasonalGreeting(id, {
    ...request.body,
    ...(characterImage ? { characterImage } : {}),
  })
  response.json({ success: true, data: greeting })
}

export async function deleteGreetingAdmin(request: Request, response: Response) {
  const id = readString(request.params.id, 'id')
  await deleteSeasonalGreeting(id)
  response.json({ success: true, message: 'Seasonal greeting deleted.' })
}

// BYOB Settings Admin
export async function getByobSettingsAdmin(_request: Request, response: Response) {
  response.json({ success: true, data: await getByobSettings() })
}

export async function updateByobSettingsAdmin(request: Request, response: Response) {
  response.json({ success: true, data: await updateByobSettings(request.body) })
}

// Pretty Play Rewards Admin
export async function getRewardsAdmin(_request: Request, response: Response) {
  response.json({ success: true, data: await listAllRewards() })
}

// Damage Claims Admin
export async function getDamageClaimsAdmin(_request: Request, response: Response) {
  response.json({ success: true, data: await listDamageClaims() })
}

export async function updateDamageClaimAdmin(request: Request, response: Response) {
  const id = readString(request.params.id, 'id')
  const status = readString(request.body?.status, 'status')
  response.json({ success: true, data: await updateDamageClaimStatus(id, status) })
}

// Business Info Admin
export async function getBusinessInfoAdmin(_request: Request, response: Response) {
  response.json({ success: true, data: await getBusinessInfo() })
}

export async function updateBusinessInfoAdmin(request: Request, response: Response) {
  response.json({ success: true, data: await updateBusinessInfo(request.body) })
}