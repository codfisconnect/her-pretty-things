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

export interface OrderItemResponse {
  id: string
  productName: string
  quantity: number
  unitPrice: number
  totalPrice: number
  mrpAtPurchase?: number | null
  discountAmount?: number | null
  discountPercent?: number | null
  isCustomizedScoop?: boolean
  numberOfScoops?: number | null
  colourTheme?: string | null
  preferredCharacter?: string | null
  preferredItems?: string[]
  excludedItems?: string[]
  additionalMessage?: string | null
  age?: number | null
  isByob?: boolean
  byobDetails?: any
}

export interface OrderResponse {
  id: string
  userId?: string | null
  subtotal: number
  shippingAmount: number
  totalAmount: number
  rewardCodeApplied?: string | null
  rewardDiscount?: number
  orderStatus: string
  paymentStatus: string
  razorpayOrderId?: string | null
  razorpayPaymentId?: string | null
  createdAt: string
  address: ShippingDetails
  items?: OrderItemResponse[]
}

export function createOrder(
  cartId: string,
  shipping: ShippingDetails,
  userId?: string,
  rewardCode?: string,
) {
  return apiRequest<OrderResponse>('/orders', {
    method: 'POST',
    body: JSON.stringify({ cartId, shipping, userId, rewardCode }),
  })
}

export function getOrder(orderId: string) {
  return apiRequest<OrderResponse>(`/orders/${encodeURIComponent(orderId)}`)
}

export function listUserOrders(userId: string) {
  return apiRequest<OrderResponse[]>(`/orders/user/${encodeURIComponent(userId)}`)
}

export function cancelOrder(orderId: string) {
  return apiRequest<OrderResponse>(`/orders/${encodeURIComponent(orderId)}/cancel`, {
    method: 'POST',
  })
}
