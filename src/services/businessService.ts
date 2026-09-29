import { apiRequest } from './api'

export interface BusinessInfo {
  id?: string
  companyName: string
  tagline: string
  email: string
  phone: string
  locationLocality: string
  locationCity: string
  locationState: string
  locationCountry: string
  instagramHandle: string
  instagramUrl: string
  businessHours: string
}

export async function fetchBusinessInfoApi(): Promise<BusinessInfo> {
  try {
    const res = await apiRequest<BusinessInfo>('/business')
    if (res && res.companyName) return res
  } catch {
    // Fallback default
  }
  return {
    companyName: 'Her Pretty Things',
    tagline: 'Little joys, beautifully wrapped',
    email: 'shop.herprettythings@gmail.com',
    phone: '9790858125',
    locationLocality: 'Royapettah',
    locationCity: 'Chennai',
    locationState: 'Tamil Nadu',
    locationCountry: 'India',
    instagramHandle: '@her_prettythings',
    instagramUrl: 'https://www.instagram.com/her_prettythings/',
    businessHours: 'Mon - Sat: 10:00 AM - 7:00 PM IST',
  }
}

export async function submitDamageClaimApi(data: {
  orderNumber: string
  customerName: string
  customerEmail: string
  productName: string
  unboxingVideoUrl?: string
  photoUrls?: string[]
  description: string
}) {
  return await apiRequest<{ success: boolean; data: any; message: string }>('/business/damage-claim', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}
