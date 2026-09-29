import { getDatabase } from '../config/database.js'
import { HttpError } from '../middleware/errorHandler.js'
import { notifyDamageClaim } from './notificationService.js'

export async function getBusinessInfo() {
  const database = getDatabase()
  let info = await database.businessInfo.findFirst().catch(() => null)
  if (!info) {
    info = {
      id: 'default-business-info',
      companyName: 'Her Pretty Things',
      tagline: 'Little joys, beautifully wrapped',
      email: 'shop.herprettythings@gmail.com',
      phone: '9790858125',
      locationLocality: 'Royapettah',
      locationCity: 'Chennai',
      locationState: 'Tamil Nadu',
      locationCountry: 'India',
      instagramHandle: '@her_prettythings',
      instagramUrl: 'https://www.instagram.com/her_prettythings/',
      businessHours: 'Mon - Sat: 10:00 AM - 7:00 PM IST',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  }
  return info
}

export async function updateBusinessInfo(data: any) {
  const database = getDatabase()
  const current = await getBusinessInfo()

  return await database.businessInfo.upsert({
    where: { id: current.id },
    update: {
      phone: data.phone?.trim() || current.phone,
      email: data.email?.trim() || current.email,
      locationLocality: data.locationLocality?.trim() || current.locationLocality,
      locationCity: data.locationCity?.trim() || current.locationCity,
      locationState: data.locationState?.trim() || current.locationState,
      locationCountry: data.locationCountry?.trim() || current.locationCountry,
      instagramHandle: data.instagramHandle?.trim() || current.instagramHandle,
      instagramUrl: data.instagramUrl?.trim() || current.instagramUrl,
      businessHours: data.businessHours?.trim() || current.businessHours,
    },
    create: {
      id: current.id,
      phone: data.phone?.trim() || current.phone,
      email: data.email?.trim() || current.email,
      locationLocality: data.locationLocality?.trim() || current.locationLocality,
      locationCity: data.locationCity?.trim() || current.locationCity,
      locationState: data.locationState?.trim() || current.locationState,
      locationCountry: data.locationCountry?.trim() || current.locationCountry,
      instagramHandle: data.instagramHandle?.trim() || current.instagramHandle,
      instagramUrl: data.instagramUrl?.trim() || current.instagramUrl,
      businessHours: data.businessHours?.trim() || current.businessHours,
    },
  })
}

export async function submitDamageClaim(data: {
  orderNumber: string
  customerName?: string
  customerEmail?: string
  email?: string
  productName: string
  unboxingVideoUrl?: string
  photoUrls?: string[]
  description: string
}) {
  const database = getDatabase()
  const customerEmail = data.customerEmail?.trim() || data.email?.trim()

  if (!data.orderNumber || !customerEmail || !data.productName || !data.description) {
    throw new HttpError(400, 'Order number, email, product name, and damage description are required.')
  }

  const claim = await database.damageClaim.create({
    data: {
      orderNumber: data.orderNumber.trim(),
      customerName: data.customerName?.trim() || 'Customer',
      customerEmail: customerEmail,
      productName: data.productName.trim(),
      unboxingVideoUrl: data.unboxingVideoUrl?.trim() || null,
      photoUrls: data.photoUrls || [],
      description: data.description.trim(),
      status: 'SUBMITTED',
    },
  })

  notifyDamageClaim(claim).catch((err) => {
    console.error('Failed to notify owner of damage claim:', err)
  })

  return claim
}

export async function listDamageClaims() {
  const database = getDatabase()
  return await database.damageClaim.findMany({
    orderBy: { createdAt: 'desc' },
  })
}

export async function updateDamageClaimStatus(id: string, status: string) {
  const database = getDatabase()
  return await database.damageClaim.update({
    where: { id },
    data: { status },
  })
}
