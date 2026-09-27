import { getDatabase } from '../config/database.js'
import { HttpError } from '../middleware/errorHandler.js'

export async function getWishlist(params: { userId?: string; sessionId?: string }) {
  const database = getDatabase()
  if (!params.userId && !params.sessionId) return []

  const items = await database.wishlistItem.findMany({
    where: {
      userId: params.userId || undefined,
      sessionId: !params.userId ? params.sessionId : undefined,
    },
    include: {
      product: {
        include: { images: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return items.map((w: any) => {
    const p = w.product
    if (!p) return null
    const sellingPrice = Number(p.price)
    const mrp = p.mrp !== null && p.mrp !== undefined ? Number(p.mrp) : sellingPrice
    const discountAmount = mrp > sellingPrice ? mrp - sellingPrice : 0
    const discountPercent = mrp > sellingPrice && mrp > 0 ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0
    const image = Array.isArray(p.images) && p.images.length > 0
      ? (typeof p.images[0] === 'string' ? p.images[0] : p.images[0].url)
      : (p.image || '')

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      category: p.category,
      price: sellingPrice,
      mrp,
      discountAmount,
      discountPercent,
      stock: p.stock,
      byobEligible: Boolean(p.byobEligible),
      image,
      images: (p.images || []).map((img: any) => typeof img === 'string' ? img : img.url),
    }
  }).filter(Boolean)
}

export async function toggleWishlist(params: { productId: string; userId?: string; sessionId?: string }) {
  const database = getDatabase()
  const { productId, userId, sessionId } = params

  if (!productId) throw new HttpError(400, 'productId is required.')
  if (!userId && !sessionId) throw new HttpError(400, 'userId or sessionId is required.')

  const existing = await database.wishlistItem.findFirst({
    where: {
      productId,
      userId: userId || undefined,
      sessionId: !userId ? sessionId : undefined,
    },
  })

  if (existing) {
    await database.wishlistItem.delete({
      where: { id: existing.id },
    })
    return { wishlisted: false, productId }
  }

  await database.wishlistItem.create({
    data: {
      productId,
      userId: userId || null,
      sessionId: sessionId || null,
    },
  })

  return { wishlisted: true, productId }
}

export async function mergeGuestWishlist(params: { userId: string; productIds: string[] }) {
  const database = getDatabase()
  const { userId, productIds } = params
  if (!userId || !Array.isArray(productIds) || productIds.length === 0) return

  for (const productId of productIds) {
    const existing = await database.wishlistItem.findFirst({
      where: { userId, productId },
    })
    if (!existing) {
      await database.wishlistItem.create({
        data: { userId, productId },
      }).catch(() => undefined)
    }
  }

  return await getWishlist({ userId })
}
