import type { Request, Response } from 'express'
import { getProducts as fetchProducts, getProductById as fetchProductById } from '../services/productService.js'

export async function getProducts(request: Request, response: Response) {
  const category = typeof request.query.category === 'string' ? request.query.category.trim() : undefined
  const byobOnly = request.query.byobEligible === 'true' || request.query.byob === 'true'

  const products = await fetchProducts(category, byobOnly)

  response.json({
    success: true,
    data: products,
  })
}

export async function getProductById(request: Request, response: Response) {
  const id = String(request.params.id)
  const product = await fetchProductById(id)

  response.json({
    success: true,
    data: product,
  })
}