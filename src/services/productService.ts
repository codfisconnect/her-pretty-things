import type { Product } from '../types/product'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api'

export async function getProducts(category?: string): Promise<Product[]> {
  const query = category
    ? `?category=${encodeURIComponent(category)}`
    : ''

  const response = await fetch(`${API_BASE_URL}/products${query}`)

  if (!response.ok) {
    throw new Error('Could not load products.')
  }

  const result = await response.json()

  return result.data
}

export async function getProductById(id: string): Promise<Product> {
  const response = await fetch(
    `${API_BASE_URL}/products/${encodeURIComponent(id)}`,
  )

  if (!response.ok) {
    throw new Error('Could not load product.')
  }

  const result = await response.json()
  return result.data
}