import { apiRequest } from './api'

export interface InstagramPost {
  id: string
  caption?: string
  mediaType: string
  thumbnailUrl: string
  permalink: string
  timestamp: string
}

export interface InstagramFeedResponse {
  configured: boolean
  profile: {
    handle: string
    url: string
  }
  data: InstagramPost[]
  message?: string
}

export const DEFAULT_INSTAGRAM_PROFILE = {
  handle: '@herprettythings',
  url: 'https://www.instagram.com/her_prettythings/',
}

export async function getRecentInstagramMedia(): Promise<InstagramFeedResponse> {
  try {
    const response = await apiRequest<InstagramFeedResponse | InstagramPost[]>(
      '/instagram/recent',
      { raw: true },
    )

    // Handle both wrapped envelope { data: [...] } and unwrapped array [...]
    const data: InstagramPost[] = Array.isArray(response)
      ? response
      : Array.isArray((response as any)?.data)
        ? (response as any).data
        : []

    const profile =
      !Array.isArray(response) && (response as any)?.profile?.url
        ? (response as any).profile
        : DEFAULT_INSTAGRAM_PROFILE

    const configured =
      !Array.isArray(response) && typeof (response as any)?.configured === 'boolean'
        ? (response as any).configured
        : data.length > 0

    return {
      configured,
      profile,
      data,
      message: !Array.isArray(response) ? (response as any)?.message : undefined,
    }
  } catch (error) {
    console.warn('[Instagram] Could not load Instagram media from backend:', error)
    return {
      configured: false,
      profile: DEFAULT_INSTAGRAM_PROFILE,
      data: [],
      message: 'Failed to connect to backend Instagram service.',
    }
  }
}
