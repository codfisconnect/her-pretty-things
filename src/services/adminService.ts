import { apiRequest } from './api'

export type AdminOrderStatus = 'PENDING_PAYMENT' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'

export interface AdminOrderItem {
  id: string
  productName: string
  quantity: number
  unitPrice: number
  totalPrice: number
  isCustomizedScoop: boolean
  numberOfScoops: number | null
  colourTheme: string | null
  preferredCharacter: string | null
  preferredItems: string[]
  excludedItems: string[]
  additionalMessage: string | null
}

export interface AdminOrder {
  id: string
  createdAt: string
  subtotal: number
  shippingAmount: number
  totalAmount: number
  orderStatus: AdminOrderStatus
  paymentStatus: string
  razorpayPaymentId: string | null
  customer: { name: string; email: string; phone: string }
  address: { fullName: string; phoneNumber: string; email: string; addressLine1: string; addressLine2: string | null; city: string; state: string; pincode: string }
  items: AdminOrderItem[]
}

export interface AdminDashboard { metrics: { totalOrders: number; pendingPayment: number; paidOrders: number; processing: number; shipped: number; delivered: number; revenue: number }; recentOrders: AdminOrder[] }

export function adminLogin(email: string, password: string) { return apiRequest<{ email: string }>('/admin/login', { method: 'POST', body: JSON.stringify({ email, password }) }) }
export function adminLogout() { return apiRequest<void>('/admin/logout', { method: 'POST' }) }
export function getAdminSession() { return apiRequest<{ authenticated: boolean }>('/admin/session') }
export function getAdminDashboard() { return apiRequest<AdminDashboard>('/admin/dashboard') }
export function getAdminOrders() { return apiRequest<AdminOrder[]>('/admin/orders') }
export function getAdminOrder(orderId: string) { return apiRequest<AdminOrder>(`/admin/orders/${encodeURIComponent(orderId)}`) }
export function updateAdminOrderStatus(orderId: string, status: AdminOrderStatus) { return apiRequest<AdminOrder>(`/admin/orders/${encodeURIComponent(orderId)}/status`, { method: 'PUT', body: JSON.stringify({ status }) }) }


export interface CreateProductInput {
  name: string
  category: 'scoops' | 'jewellery' | 'kawaii'
  price: number
  description: string
  stock: number
  image?: string
}

export interface AdminProduct {
  id: string
  name: string
  slug: string
  category: string
  price: number
  description: string
  stock: number
  images: {
    id: string
    url: string
    altText: string | null
    sortOrder: number
  }[]
}

export function createAdminProduct(input: CreateProductInput) {
  return apiRequest<AdminProduct>('/admin/products', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}