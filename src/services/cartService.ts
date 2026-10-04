import { apiRequest } from './api'
import type { ScoopConfiguration } from '../pages/Scoops/scoopTypes'

export interface CartProductDetails {
  id: string
  name: string
  slug?: string
  category?: string
  price: number
  mrp?: number
  discountAmount?: number
  discountPercent?: number
  stock?: number
  image?: string
}

export interface CartItemResponse {
  id: string
  cartId?: string
  productId?: string | null
  quantity: number
  unitPrice: number
  subtotal: number
  shipping: number
  total: number
  isCustomizedScoop: boolean
  numberOfScoops: number | null
  colourTheme: string | null
  preferredCharacter: string | null
  preferredItems: string[]
  excludedItems: string[]
  additionalMessage: string | null
  age?: number | null
  isByob?: boolean
  byobDetails?: {
    items: Array<{
      productId: string
      name: string
      price: number
      mrp?: number
      quantity: number
      lineTotal: number
      image?: string
      category?: string
    }>
    boxSubtotal: number
    minimumSubtotal: number
    shippingFee: number
  } | null
  product: CartProductDetails | null
}

export interface CartResponse {
  id: string
  userId?: string | null
  sessionId?: string | null
  items: CartItemResponse[]
  itemCount: number
  subtotal: number
  shipping: number
  total: number
}

export interface AddCartItemRequest {
  cartId?: string
  sessionId?: string
  userId?: string
  productId?: string
  quantity?: number
  scoopConfiguration?: ScoopConfiguration
  isByob?: boolean
  byobDetails?: any
  byobBox?: {
    items: Array<{ productId: string; quantity: number }>
  }
}

export function addCartItem(item: AddCartItemRequest) {
  return apiRequest<CartResponse>('/cart/items', { method: 'POST', body: JSON.stringify(item) })
}

export function getCart(cartId: string) {
  return apiRequest<CartResponse>(`/cart/${encodeURIComponent(cartId)}`)
}

export function getOrCreateCart(cartId?: string, sessionId?: string, userId?: string) {
  return apiRequest<CartResponse>('/cart/get-or-create', {
    method: 'POST',
    body: JSON.stringify({ cartId, sessionId, userId }),
  })
}

export function updateCartItem(itemId: string, quantity: number, scoopConfiguration?: ScoopConfiguration) {
  return apiRequest<CartResponse>(`/cart/items/${encodeURIComponent(itemId)}`, {
    method: 'PUT',
    body: JSON.stringify({ quantity, scoopConfiguration }),
  })
}

export function removeCartItem(itemId: string) {
  return apiRequest<CartResponse>(`/cart/items/${encodeURIComponent(itemId)}`, { method: 'DELETE' })
}

export function clearCartApi(cartId: string) {
  return apiRequest<CartResponse>(`/cart/${encodeURIComponent(cartId)}`, { method: 'DELETE' })
}
