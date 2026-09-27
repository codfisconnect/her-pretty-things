import { getDatabase } from '../config/database.js'
import { HttpError } from '../middleware/errorHandler.js'

export async function getByobSettings() {
  const database = getDatabase()
  let settings = await database.byobSetting.findFirst().catch(() => null)
  if (!settings) {
    settings = {
      id: 'default-byob-setting',
      enabled: true,
      minimumSubtotal: 1000,
      shippingFee: 150,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  }
  return settings
}

export async function updateByobSettings(data: { enabled?: boolean; minimumSubtotal?: number; shippingFee?: number }) {
  const database = getDatabase()
  const current = await getByobSettings()

  const minSub = data.minimumSubtotal !== undefined ? Number(data.minimumSubtotal) : current.minimumSubtotal
  const shipping = data.shippingFee !== undefined ? Number(data.shippingFee) : current.shippingFee

  if (Number.isNaN(minSub) || minSub < 0) {
    throw new HttpError(400, 'minimumSubtotal must be a non-negative number.')
  }
  if (Number.isNaN(shipping) || shipping < 0) {
    throw new HttpError(400, 'shippingFee must be a non-negative number.')
  }

  return await database.byobSetting.upsert({
    where: { id: current.id },
    update: {
      enabled: data.enabled !== undefined ? Boolean(data.enabled) : current.enabled,
      minimumSubtotal: minSub,
      shippingFee: shipping,
    },
    create: {
      id: current.id,
      enabled: data.enabled !== undefined ? Boolean(data.enabled) : true,
      minimumSubtotal: minSub,
      shippingFee: shipping,
    },
  })
}

export async function getByobEligibleProducts() {
  const database = getDatabase()
  const products = await database.product.findMany({
    where: {
      active: true,
      byobEligible: true,
    },
    include: { images: true },
    orderBy: { createdAt: 'desc' },
  })

  return products.filter((p: any) => {
    const cat = (p.category || '').trim().toLowerCase()
    return cat === 'kawaii' || cat === 'jewellery' || cat === 'jewelry'
  }).map((product: any) => {
    const sellingPrice = Number(product.price)
    const mrp = product.mrp !== null && product.mrp !== undefined ? Number(product.mrp) : sellingPrice
    const discountAmount = mrp > sellingPrice ? mrp - sellingPrice : 0
    const discountPercent = mrp > sellingPrice && mrp > 0 ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0
    const image = Array.isArray(product.images) && product.images.length > 0
      ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url)
      : (product.image || '')

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      category: product.category,
      price: sellingPrice,
      mrp,
      discountAmount,
      discountPercent,
      stock: product.stock,
      sku: product.sku || '',
      description: product.description || '',
      image,
      images: (product.images || []).map((img: any) => typeof img === 'string' ? img : img.url),
    }
  })
}
