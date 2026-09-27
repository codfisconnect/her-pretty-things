import { getDatabase } from '../config/database.js'
import { HttpError } from '../middleware/errorHandler.js'

export interface CreateProductInput {
  name: string
  category: string
  price: number
  mrp?: number
  sku?: string
  description?: string
  stock?: number
  byobEligible?: boolean
  images?: string[]
}

export interface UpdateProductInput {
  name?: string
  category?: string
  price?: number
  mrp?: number
  sku?: string
  description?: string
  stock?: number
  byobEligible?: boolean
  images?: string[]
  active?: boolean
}

function readRequiredString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new HttpError(400, `${field} is required.`)
  }
  return value.trim()
}

function validatePrices(sellingPriceVal: unknown, mrpVal?: unknown): { sellingPrice: number; mrp: number } {
  const sellingPrice = Number(sellingPriceVal)
  if (Number.isNaN(sellingPrice) || !Number.isInteger(sellingPrice) || sellingPrice < 0) {
    throw new HttpError(400, 'Selling price must be a non-negative whole number (₹).')
  }

  let mrp = mrpVal !== undefined && mrpVal !== null ? Number(mrpVal) : sellingPrice
  if (Number.isNaN(mrp) || !Number.isInteger(mrp) || mrp < 0) {
    throw new HttpError(400, 'MRP must be a non-negative whole number (₹).')
  }

  if (sellingPrice > mrp) {
    throw new HttpError(400, 'Selling price cannot be greater than MRP.')
  }

  return { sellingPrice, mrp }
}

function readStock(value: unknown): number {
  if (value === undefined || value === null) return 0
  const stock = Number(value)
  if (Number.isNaN(stock) || !Number.isInteger(stock) || stock < 0) {
    throw new HttpError(400, 'Stock must be a valid non-negative whole number.')
  }
  return stock
}

function serializeProduct(product: any) {
  const sellingPrice = Number(product.price)
  const mrp = product.mrp !== null && product.mrp !== undefined ? Number(product.mrp) : sellingPrice
  const discountAmount = mrp > sellingPrice ? mrp - sellingPrice : 0
  const discountPercent = mrp > sellingPrice && mrp > 0 ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0

  const images = (product.images || []).map((img: any) => typeof img === 'string' ? img : img.url)
  const primaryImage = images[0] || ''

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    category: product.category,
    mrp,
    price: sellingPrice,
    discountAmount,
    discountPercent,
    sku: product.sku || '',
    stock: product.stock,
    byobEligible: Boolean(product.byobEligible),
    active: product.active !== undefined ? product.active : true,
    description: product.description || '',
    images,
    image: primaryImage,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  }
}

export async function getProducts(category?: string, byobOnly?: boolean) {
  const database = getDatabase()
  const where: any = { active: true }

  if (category && category !== 'all') {
    where.category = category.toLowerCase()
  }

  if (byobOnly) {
    where.byobEligible = true
  }

  const products = await database.product.findMany({
    where,
    include: { images: true },
    orderBy: { createdAt: 'desc' },
  })

  return products.map(serializeProduct)
}

export async function getProductById(productId: string) {
  const database = getDatabase()
  const product = await database.product.findUnique({
    where: { id: productId },
    include: { images: true },
  })

  if (!product) {
    // Try by slug
    const bySlug = await database.product.findUnique({
      where: { slug: productId },
      include: { images: true },
    })
    if (!bySlug) throw new HttpError(404, 'Product not found.')
    return serializeProduct(bySlug)
  }

  return serializeProduct(product)
}

export async function createProduct(input: CreateProductInput) {
  const database = getDatabase()
  const name = readRequiredString(input.name, 'name')
  const category = readRequiredString(input.category, 'category')
  const { sellingPrice, mrp } = validatePrices(input.price, input.mrp)
  const description = typeof input.description === 'string' ? input.description.trim() : ''
  const stock = readStock(input.stock)
  const sku = typeof input.sku === 'string' && input.sku.trim() ? input.sku.trim() : `HPT-${Date.now().toString().slice(-4)}`
  const normalizedCat = category.trim().toLowerCase()
  const isByobCategory = normalizedCat === 'jewellery' || normalizedCat === 'jewelry' || normalizedCat === 'kawaii'
  const byobEligible = input.byobEligible !== undefined
    ? Boolean(input.byobEligible)
    : isByobCategory

  const slug = `${name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')}-${Date.now().toString().slice(-4)}`

  const product = await database.product.create({
    data: {
      name,
      slug,
      category,
      price: sellingPrice,
      mrp,
      sku,
      stock,
      byobEligible,
      description,
      images: input.images && input.images.length > 0
        ? {
            create: input.images.map((url, index) => ({
              url: url.trim(),
              sortOrder: index,
            })),
          }
        : undefined,
    },
    include: {
      images: true,
    },
  })

  return serializeProduct(product)
}

export async function updateProduct(productId: string, input: UpdateProductInput) {
  const database = getDatabase()
  const existingProduct = await database.product.findUnique({
    where: { id: productId },
    include: { images: true },
  })

  if (!existingProduct) {
    throw new HttpError(404, 'Product not found.')
  }

  const data: any = {}

  if (input.name !== undefined) {
    data.name = readRequiredString(input.name, 'name')
  }

  if (input.category !== undefined) {
    data.category = readRequiredString(input.category, 'category')
  }

  if (input.price !== undefined || input.mrp !== undefined) {
    const finalPrice = input.price !== undefined ? input.price : existingProduct.price
    const finalMrp = input.mrp !== undefined ? input.mrp : existingProduct.mrp ?? finalPrice
    const { sellingPrice, mrp } = validatePrices(finalPrice, finalMrp)
    data.price = sellingPrice
    data.mrp = mrp
  }

  if (input.sku !== undefined) {
    data.sku = input.sku.trim()
  }

  if (input.byobEligible !== undefined) {
    data.byobEligible = Boolean(input.byobEligible)
  }

  if (input.description !== undefined) {
    data.description = input.description.trim()
  }

  if (input.stock !== undefined) {
    data.stock = readStock(input.stock)
  }

  if (input.active !== undefined) {
    data.active = Boolean(input.active)
  }

  await database.product.update({
    where: { id: productId },
    data,
  })

  if (input.images !== undefined) {
    await database.productImage.deleteMany({
      where: { productId },
    })

    if (input.images.length > 0) {
      await database.productImage.createMany({
        data: input.images
          .filter((url) => url.trim().length > 0)
          .map((url, index) => ({
            productId,
            url: url.trim(),
            sortOrder: index,
          })),
      })
    }
  }

  const updatedProduct = await database.product.findUnique({
    where: { id: productId },
    include: { images: true },
  })

  return serializeProduct(updatedProduct)
}

export async function deactivateProduct(productId: string) {
  const database = getDatabase()
  const product = await database.product.update({
    where: { id: productId },
    data: { active: false },
    include: { images: true },
  })
  return serializeProduct(product)
}