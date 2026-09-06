import { apiRequest } from './api'
import type { ScoopConfiguration } from '../pages/Scoops/scoopTypes'

export interface CartItemResponse {
	id: string
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
	product: { id: string; name: string; price: number } | null
}

export interface CartResponse {
	id: string
	items: CartItemResponse[]
	subtotal: number
	shipping: number
	total: number
}

export interface AddCartItemRequest {
	cartId?: string
	sessionId?: string
	productId?: string
	quantity?: number
	scoopConfiguration?: ScoopConfiguration
}

export function addCartItem(item: AddCartItemRequest) {
	return apiRequest<CartResponse>('/cart/items', { method: 'POST', body: JSON.stringify(item) })
}

export function getCart(cartId: string) {
	return apiRequest<CartResponse>(`/cart/${encodeURIComponent(cartId)}`)
}

export function updateCartItem(itemId: string, quantity: number) {
	return apiRequest<CartResponse>(`/cart/items/${encodeURIComponent(itemId)}`, { method: 'PUT', body: JSON.stringify({ quantity }) })
}

export function removeCartItem(itemId: string) {
	return apiRequest<CartResponse>(`/cart/items/${encodeURIComponent(itemId)}`, { method: 'DELETE' })
}
