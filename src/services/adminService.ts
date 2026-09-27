import { apiRequest } from './api'

export type AdminOrderStatus =
  | 'PENDING_PAYMENT'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'

export interface AdminOrderItem {
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
  age?: number | null
  colourTheme?: string | null
  preferredCharacter?: string | null
  preferredItems?: string[]
  excludedItems?: string[]
  additionalMessage?: string | null
  isByob?: boolean
  byobDetails?: any
}

export interface AdminOrder {
  id: string
  createdAt: string
  subtotal: number
  shippingAmount: number
  totalAmount: number
  rewardCodeApplied?: string | null
  rewardDiscount?: number
  orderStatus: AdminOrderStatus
  paymentStatus: string
  razorpayPaymentId: string | null
  customer: {
    name: string
    email: string
    phone: string
  }
  address: {
    fullName: string
    phoneNumber: string
    email: string
    addressLine1: string
    addressLine2: string | null
    city: string
    state: string
    pincode: string
  }
  items: AdminOrderItem[]
}

export interface AdminDashboard {
  metrics: {
    totalOrders: number
    pendingPayment: number
    paidOrders: number
    processing: number
    shipped: number
    delivered: number
    cancelled?: number
    revenue: number
    totalProducts?: number
    lowStock?: number
    outOfStock?: number
    byobOrders?: number
    prettyPlayRewards?: number
  }
  recentOrders: AdminOrder[]
}

export interface CreateAdminProductInput {
  name: string
  category: 'scoops' | 'jewellery' | 'kawaii' | string
  price: number
  mrp?: number
  sku?: string
  description?: string
  stock?: number
  byobEligible?: boolean
}

export interface UpdateAdminProductInput {
  name?: string
  category?: 'scoops' | 'jewellery' | 'kawaii' | string
  price?: number
  mrp?: number
  sku?: string
  description?: string
  stock?: number
  byobEligible?: boolean
  active?: boolean
  images?: string[]
}

export function adminLogin(email: string, password: string) {
  return apiRequest<{ email: string }>('/admin/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export function adminLogout() {
  return apiRequest<void>('/admin/logout', {
    method: 'POST',
  })
}

export function getAdminSession() {
  return apiRequest<{ authenticated: boolean }>('/admin/session')
}

export function getAdminDashboard() {
  return apiRequest<AdminDashboard>('/admin/dashboard')
}

export function getAdminOrders(params?: { status?: string; paymentStatus?: string; search?: string }) {
  const query = new URLSearchParams()
  if (params?.status && params.status !== 'ALL') query.set('status', params.status)
  if (params?.paymentStatus && params.paymentStatus !== 'ALL') query.set('paymentStatus', params.paymentStatus)
  if (params?.search?.trim()) query.set('search', params.search.trim())
  const queryString = query.toString()
  return apiRequest<AdminOrder[]>(`/admin/orders${queryString ? `?${queryString}` : ''}`)
}

export function getAdminOrder(orderId: string) {
  return apiRequest<AdminOrder>(
    `/admin/orders/${encodeURIComponent(orderId)}`,
  )
}

export function updateAdminOrderStatus(
  orderId: string,
  status: AdminOrderStatus,
) {
  return apiRequest<AdminOrder>(
    `/admin/orders/${encodeURIComponent(orderId)}/status`,
    {
      method: 'PUT',
      body: JSON.stringify({ status }),
    },
  )
}

export function createAdminProduct(
  input: CreateAdminProductInput,
  imageFiles?: File[],
) {
  const formData = new FormData()
  formData.append('name', input.name)
  formData.append('category', input.category)
  formData.append('price', String(input.price))
  if (input.mrp !== undefined) formData.append('mrp', String(input.mrp))
  if (input.sku !== undefined) formData.append('sku', input.sku)
  if (input.byobEligible !== undefined) formData.append('byobEligible', String(input.byobEligible))
  if (input.description !== undefined) formData.append('description', input.description)
  if (input.stock !== undefined) formData.append('stock', String(input.stock))

  if (imageFiles) {
    imageFiles.forEach((file) => {
      formData.append('image', file)
    })
  }

  return apiRequest('/admin/products', {
    method: 'POST',
    body: formData,
  })
}

export function updateAdminProduct(
  productId: string,
  input: UpdateAdminProductInput,
  imageFiles?: File[],
) {
  const formData = new FormData()
  if (input.name !== undefined) formData.append('name', input.name)
  if (input.category !== undefined) formData.append('category', input.category)
  if (input.price !== undefined) formData.append('price', String(input.price))
  if (input.mrp !== undefined) formData.append('mrp', String(input.mrp))
  if (input.sku !== undefined) formData.append('sku', input.sku)
  if (input.byobEligible !== undefined) formData.append('byobEligible', String(input.byobEligible))
  if (input.description !== undefined) formData.append('description', input.description)
  if (input.stock !== undefined) formData.append('stock', String(input.stock))
  if (input.active !== undefined) formData.append('active', String(input.active))

  if (input.images) {
    input.images.forEach((url) => {
      formData.append('images', url)
    })
  }

  if (imageFiles) {
    imageFiles.forEach((file) => {
      formData.append('image', file)
    })
  }

  return apiRequest(`/admin/products/${encodeURIComponent(productId)}`, {
    method: 'PUT',
    body: formData,
  })
}

export function deactivateAdminProduct(productId: string) {
  return apiRequest(`/admin/products/${encodeURIComponent(productId)}`, {
    method: 'DELETE',
  })
}

export const deleteAdminProduct = deactivateAdminProduct

export async function uploadAdminProductImages(files: File[]): Promise<string[]> {
  const urls: string[] = []
  for (const file of files) {
    const formData = new FormData()
    formData.append('image', file)
    try {
      const res = await apiRequest<{ data: { url: string } }>('/admin/products/upload-image', {
        method: 'POST',
        body: formData,
      })
      if (res.data?.url) {
        urls.push(res.data.url)
      }
    } catch (e) {
      console.error('Image upload failed:', e)
    }
  }
  return urls
}

/* Scoop Admin */
export interface AdminScoopSetting {
  id: string
  firstScoopPrice: number
  additionalScoopPrice: number
  maxScoops: number
  maxPreferredItems: number
  maxExcludedItems: number
  active: boolean
  imageUrl: string | null
}

export interface AdminScoopShippingRule {
  id: string
  scoopCount: number
  shipping: number
  active: boolean
}

export interface AdminScoopOption {
  id: string
  name: string
  active: boolean
  sortOrder: number
}

export interface AdminScoopConfig {
  setting: AdminScoopSetting
  shippingRules: AdminScoopShippingRule[]
  colours: AdminScoopOption[]
  characters: AdminScoopOption[]
  items: AdminScoopOption[]
}

export function getAdminScoopConfig() {
  return apiRequest<AdminScoopConfig>('/admin/scoop/config')
}

export function updateAdminScoopSetting(
  input: Partial<AdminScoopSetting>,
) {
  return apiRequest<AdminScoopConfig>('/admin/scoop/config', {
    method: 'PUT',
    body: JSON.stringify(input),
  })
}

export function updateAdminScoopOption(
  type: 'colour' | 'character' | 'item',
  id: string,
  input: { name?: string; active?: boolean },
) {
  return apiRequest<AdminScoopOption>(
    `/admin/scoop/options/${encodeURIComponent(type)}/${encodeURIComponent(id)}`,
    {
      method: 'PUT',
      body: JSON.stringify(input),
    },
  )
}

export function createAdminScoopOption(
  type: 'colour' | 'character' | 'item',
  name: string,
) {
  return apiRequest<AdminScoopOption>('/admin/scoop/options', {
    method: 'POST',
    body: JSON.stringify({ type, name }),
  })
}

export function deleteAdminScoopOption(
  type: 'colour' | 'character' | 'item',
  id: string,
) {
  return apiRequest<void>(
    `/admin/scoop/options/${encodeURIComponent(type)}/${encodeURIComponent(id)}`,
    {
      method: 'DELETE',
    },
  )
}

export async function uploadAdminScoopImage(file: File): Promise<{ url: string; imageUrl: string }> {
  const formData = new FormData()
  formData.append('image', file)
  const res = await apiRequest<{ url: string }>('/admin/scoop/image', {
    method: 'POST',
    body: formData,
  })
  return { url: res.url, imageUrl: res.url }
}

/* Seasonal Character Greetings Admin */
export function getAdminGreetings() {
  return apiRequest<any[]>('/admin/seasonal-greetings')
}

export function createAdminGreeting(formData: FormData) {
  return apiRequest('/admin/seasonal-greetings', {
    method: 'POST',
    body: formData,
  })
}

export function updateAdminGreeting(id: string, formData: FormData) {
  return apiRequest(`/admin/seasonal-greetings/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: formData,
  })
}

export function deleteAdminGreeting(id: string) {
  return apiRequest(`/admin/seasonal-greetings/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}

/* BYOB Admin */
export function getAdminByobSettings() {
  return apiRequest<{ id: string; enabled: boolean; minimumSubtotal: number; shippingFee: number }>('/admin/byob/settings')
}

export function updateAdminByobSettings(data: { enabled?: boolean; minimumSubtotal?: number; shippingFee?: number }) {
  return apiRequest('/admin/byob/settings', {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

/* Rewards Admin */
export function getAdminRewards() {
  return apiRequest<any[]>('/admin/rewards')
}

/* Damage Claims Admin */
export function getAdminClaims() {
  return apiRequest<any[]>('/admin/claims')
}

export function updateAdminClaimStatus(id: string, status: string) {
  return apiRequest(`/admin/claims/${encodeURIComponent(id)}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  })
}

/* Business Info Admin */
export function getAdminBusinessInfo() {
  return apiRequest<any>('/admin/business')
}

export function updateAdminBusinessInfo(data: any) {
  return apiRequest('/admin/business', {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}