import { apiRequest } from './api'

export interface ScoopConfig {
  pricing?: {
    firstScoop: number
    additionalScoop: number
  }
  imageUrl?: string | null
  limits?: {
    maxScoops: number
    maxPreferredItems: number
    maxExcludedItems: number
  }
  shippingRules?: {
    scoopCount: number
    shipping: number
  }[]
  colours?: { id: string; name: string }[]
  characters?: { id: string; name: string }[]
  items?: { id: string; name: string }[]
}

export async function getScoopConfig(): Promise<ScoopConfig | null> {
  try {
    const config = await apiRequest<ScoopConfig>('/scoop/config')
    return config
  } catch (error) {
    console.error('Could not load Scoop configuration:', error)
    return null
  }
}
