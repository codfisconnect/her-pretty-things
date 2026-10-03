import type { Product } from '../types/product'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api'

export async function getProducts(
  category?: string,
  optionsOrSearch?: string | boolean | { search?: string; byobOnly?: boolean },
): Promise<Product[]> {
  let search: string | undefined
  let byobOnly: boolean | undefined

  if (typeof optionsOrSearch === 'string') {
    search = optionsOrSearch
  } else if (typeof optionsOrSearch === 'boolean') {
    byobOnly = optionsOrSearch
  } else if (optionsOrSearch && typeof optionsOrSearch === 'object') {
    search = optionsOrSearch.search
    byobOnly = optionsOrSearch.byobOnly
  }

  const params = new URLSearchParams()

  if (category && category !== 'all') {
    params.set('category', category)
  }

  if (search) {
    params.set('search', search)
  }

  if (byobOnly) {
    params.set('byobEligible', 'true')
  }

  const query = params.toString() ? `?${params.toString()}` : ''

  const response = await fetch(`${API_BASE_URL}/products${query}`)

  if (!response.ok) {
    throw new Error(`Failed to load products (${response.status})`)
  }

  const result = await response.json()

  if (!Array.isArray(result.data)) {
    throw new Error('Invalid product response from backend.')
  }

  return result.data
}

export async function getProductById(id: string): Promise<Product> {
  const response = await fetch(
    `${API_BASE_URL}/products/${encodeURIComponent(id)}`,
  )

  if (!response.ok) {
    throw new Error(`Could not load product (${response.status})`)
  }

  const result = await response.json()

  if (!result.data) {
    throw new Error('Could not load product.')
  }

  return result.data
}