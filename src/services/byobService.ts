import type { Product } from '../types/product'
import { apiRequest } from './api'
import { products as fallbackProducts } from '../data/products'

export interface ByobSettings {
  id: string
  enabled: boolean
  minimumSubtotal: number
  shippingFee: number
}

export async function fetchByobSettings(): Promise<ByobSettings> {
  try {
    const res = await apiRequest<ByobSettings>('/byob/settings')
    if (res && typeof res.minimumSubtotal === 'number') return res
  } catch {
    // Fallback default
  }
  return {
    id: 'default',
    enabled: true,
    minimumSubtotal: 1000,
    shippingFee: 150,
  }
}

export async function fetchByobProducts(): Promise<Product[]> {
  try {
    const res = await apiRequest<Product[]>('/byob/products')
    if (Array.isArray(res)) return res
  } catch {
    // Fallback
  }
  return fallbackProducts.filter((p) => {
    const cat = (p.category || '').trim().toLowerCase()
    return p.byobEligible && (cat === 'kawaii' || cat === 'jewellery' || cat === 'jewelry')
  })
}
