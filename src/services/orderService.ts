import { apiRequest } from './api'

export interface ShippingDetails {
	fullName: string
	phoneNumber: string
	email: string
	addressLine1: string
	addressLine2?: string
	city: string
	state: string
	pincode: string
}

export interface OrderResponse {
	id: string
	subtotal: number
	shippingAmount: number
	totalAmount: number
	orderStatus: string
	paymentStatus: string
	address: ShippingDetails
}

export function createOrder(cartId: string, shipping: ShippingDetails) {
	return apiRequest<OrderResponse>('/orders', { method: 'POST', body: JSON.stringify({ cartId, shipping }) })
}

export function getOrder(orderId: string) {
	return apiRequest<OrderResponse>(`/orders/${encodeURIComponent(orderId)}`)
}
