import { apiRequest } from './api'

export interface CustomerUser {
  id: string
  email: string
  name: string | null
  phone: string | null
  role: string
  addresses?: any[]
}

const USER_KEY = 'hpt_customer_user'

export function getStoredUser(): CustomerUser | null {
  const saved = localStorage.getItem(USER_KEY)
  if (!saved) return null
  try {
    return JSON.parse(saved) as CustomerUser
  } catch {
    return null
  }
}

export function saveStoredUser(user: CustomerUser | null): void {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  } else {
    localStorage.removeItem(USER_KEY)
  }
}

export async function registerCustomerApi(data: { email: string; password: string; name?: string; phone?: string }) {
  const result = await apiRequest<CustomerUser>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  saveStoredUser(result)
  return result
}

export async function loginCustomerApi(data: { email: string; password: string }) {
  const result = await apiRequest<CustomerUser>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  saveStoredUser(result)
  return result
}

export async function getCustomerProfileApi(userId: string) {
  const result = await apiRequest<CustomerUser>(`/auth/profile?userId=${encodeURIComponent(userId)}`)
  saveStoredUser(result)
  return result
}

export async function updateCustomerProfileApi(userId: string, data: { name?: string; phone?: string }) {
  const result = await apiRequest<CustomerUser>('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify({ userId, ...data }),
  })
  saveStoredUser(result)
  return result
}

export async function forgotPasswordApi(email: string) {
  return await apiRequest<{ success: boolean; message: string; token?: string }>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

export async function resetPasswordApi(token: string, password: string) {
  return await apiRequest<{ success: boolean; message: string }>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, password }),
  })
}
