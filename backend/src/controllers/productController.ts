import type { Request, Response } from 'express'
import { getDatabase } from '../config/database.js'

export async function getProducts(request: Request, response: Response) {
  const database = getDatabase()

  const category =
    typeof request.query.category === 'string'
      ? request.query.category
      : undefined

  const products = await database.product.findMany({
    where: category ? { category } : undefined,
    include: {
      images: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  const formattedProducts = products.map((product) => ({
    id: product.id,
    name: product.name,
    category: product.category,
    price: product.price,
    image: product.images[0]?.url ?? '',
    rating: 5,
    description: product.description ?? '',
    stock: product.stock,
  }))

  response.json({
    success: true,
    data: formattedProducts,
  })
}