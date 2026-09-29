import type { Product } from '../types/product'
import { products as fallbackProducts } from '../data/products'

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

  try {
    const response = await fetch(`${API_BASE_URL}/products${query}`)
    if (response.ok) {
      const result = await response.json()
      if (Array.isArray(result.data)) {
        return result.data
      }
    }
  } catch (e) {
    console.warn('Backend unavailable, using localized product cache:', e)
  }

  // Graceful fallback to rich local products
  let list = [...fallbackProducts]
  if (category && category !== 'all') {
    list = list.filter((p) => p.category.toLowerCase() === category.toLowerCase())
  }
  if (search) {
    const q = search.toLowerCase()
    list = list.filter((p) => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q))
  }
  if (byobOnly) {
    list = list.filter((p) => p.byobEligible)
  }
  return list
}

export async function getProductById(id: string): Promise<Product> {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${encodeURIComponent(id)}`)
    if (response.ok) {
      const result = await response.json()
      if (result.data) return result.data
    }
  } catch (e) {
    console.warn('Backend unavailable, searching localized product cache:', e)
  }

  const found = fallbackProducts.find((p) => p.id === id || p.slug === id)
  if (found) return found

  throw new Error('Could not load product.')
}
