import type { Product } from '../types/product'
import { apiRequest } from './api'

const WISHLIST_KEY = 'hpt_wishlist'

export function getLocalWishlist(): Product[] {
  const saved = localStorage.getItem(WISHLIST_KEY)
  if (!saved) return []
  try {
    return JSON.parse(saved) as Product[]
  } catch {
    return []
  }
}

export const getWishlist = getLocalWishlist

export function saveLocalWishlist(items: Product[]): void {
  try {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(items))
  } catch {
    // Ignore storage quota errors
  }
}

export async function fetchServerWishlist(params: { userId?: string; sessionId?: string }): Promise<Product[]> {
  const searchParams = new URLSearchParams()
  if (params.userId) searchParams.set('userId', params.userId)
  if (params.sessionId) searchParams.set('sessionId', params.sessionId)
  const q = searchParams.toString() ? `?${searchParams.toString()}` : ''

  try {
    const items = await apiRequest<Product[]>(`/wishlist${q}`)
    if (Array.isArray(items)) {
      saveLocalWishlist(items)
      return items
    }
  } catch {
    // Fall back to local
  }
  return getLocalWishlist()
}

export async function syncToggleWishlist(params: { productId: string; userId?: string; sessionId?: string }) {
  try {
    return await apiRequest<{ wishlisted: boolean; productId: string }>('/wishlist/toggle', {
      method: 'POST',
      body: JSON.stringify(params),
    })
  } catch {
    return null
  }
}

export async function syncMergeWishlist(userId: string, productIds: string[]) {
  try {
    return await apiRequest<Product[]>('/wishlist/merge', {
      method: 'POST',
      body: JSON.stringify({ userId, productIds }),
    })
  } catch {
    return null
  }
}

export function isInWishlist(productId: string): boolean {
  return getLocalWishlist().some((p) => p.id === productId)
}

export function toggleWishlist(product: Product): boolean {
  const current = getLocalWishlist()
  const exists = current.some((p) => p.id === product.id)
  let updated: Product[]

  if (exists) {
    updated = current.filter((p) => p.id !== product.id)
  } else {
    updated = [...current, product]
  }

  saveLocalWishlist(updated)
  return !exists
}