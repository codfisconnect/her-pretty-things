import type { Request, Response } from 'express'

import { getDatabase } from '../config/database.js'

export async function getProducts(
  request: Request,
  response: Response,
) {
  const database = getDatabase()

  const category =
    typeof request.query.category === 'string'
      ? request.query.category.trim()
      : undefined

  const search =
    typeof request.query.search === 'string'
      ? request.query.search.trim()
      : undefined

  const activeParam =
    typeof request.query.active === 'string'
      ? request.query.active
      : undefined

  const pageParam =
    typeof request.query.page === 'string'
      ? Number(request.query.page)
      : 1

  const limitParam =
    typeof request.query.limit === 'string'
      ? Number(request.query.limit)
      : 20

  const page =
    Number.isInteger(pageParam) && pageParam > 0
      ? pageParam
      : 1

  const limit =
    Number.isInteger(limitParam) &&
      limitParam > 0 &&
      limitParam <= 100
      ? limitParam
      : 20

  const where = {
    ...(category ? { category } : {}),
    ...(search
      ? {
        name: {
          contains: search,
          mode: 'insensitive' as const,
        },
      }
      : {}),
    ...(activeParam === 'true' || activeParam === 'false'
      ? {
        active: activeParam === 'true',
      }
      : {
        active: true,
      }),
  }

  const [products, total] = await Promise.all([
    database.product.findMany({
      where,
      include: {
        images: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    }),

    database.product.count({
      where,
    }),
  ])

  const formattedProducts = products.map((product) => ({
    id: product.id,
    name: product.name,
    category: product.category,
    price: product.price,
    image: product.images[0]?.url ?? '',
    images: product.images.map((item) => item.url),
    rating: 5,
    description: product.description ?? '',
    stock: product.stock,
    active: product.active,
  }))

  response.json({
    success: true,
    data: formattedProducts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  })
}

export async function getProductById(
  request: Request,
  response: Response,
) {
  const database = getDatabase()

  const product = await database.product.findUnique({
    where: {
      id: String(request.params.id),
    },
    include: {
      images: true,
    },
  })

  if (!product) {
    response.status(404).json({
      success: false,
      message: 'Product not found.',
    })
    return
  }

  response.json({
    success: true,
    data: {
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      image: product.images[0]?.url ?? '',
      images: product.images.map((item) => item.url),
      rating: 5,
      description: product.description ?? '',
      stock: product.stock,
    },
  })
}