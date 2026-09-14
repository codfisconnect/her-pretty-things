import { getDatabase } from '../config/database.js'
import { HttpError } from '../middleware/errorHandler.js'

interface CreateProductInput {
  name: string
  category: string
  price: number
  description?: string
  stock?: number
  image?: string
}

function readRequiredString(value: unknown, field: string) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new HttpError(400, `${field} is required.`)
  }

  return value.trim()
}

function readPrice(value: unknown) {
  const price = Number(value)

  if (!Number.isInteger(price) || price < 0) {
    throw new HttpError(400, 'Price must be a valid non-negative number.')
  }

  return price
}

function readStock(value: unknown) {
  if (value === undefined) return 0

  const stock = Number(value)

  if (!Number.isInteger(stock) || stock < 0) {
    throw new HttpError(400, 'Stock must be a valid non-negative number.')
  }

  return stock
}

export async function createProduct(input: CreateProductInput) {
  const database = getDatabase()

  const name = readRequiredString(input.name, 'name')
  const category = readRequiredString(input.category, 'category')
  const price = readPrice(input.price)
  const description =
    typeof input.description === 'string'
      ? input.description.trim()
      : undefined
  const stock = readStock(input.stock)

  const slug = `${name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')}-${Date.now()}`

  const product = await database.product.create({
    data: {
      name,
      slug,
      category,
      price,
      description,
      stock,
      images: input.image
        ? {
            create: {
              url: input.image.trim(),
              sortOrder: 0,
            },
          }
        : undefined,
    },
    include: {
      images: true,
    },
  })

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    category: product.category,
    price: product.price,
    description: product.description ?? '',
    stock: product.stock,
    images: product.images,
  }
}