/**
 * Instagram Service
 * Supports official Meta / Instagram Graph API for retrieving recent media (reels/videos).
 * Keeps access tokens and account secrets strictly backend-only.
 * Includes in-memory caching to optimize performance and prevent rate limiting.
 */

export interface InstagramMediaItem {
  id: string
  caption?: string
  mediaType: string
  mediaUrl?: string
  thumbnailUrl: string
  permalink: string
  timestamp: string
}

export interface InstagramFeedResult {
  configured: boolean
  profile: {
    handle: string
    url: string
  }
  data: InstagramMediaItem[]
  message?: string
}

interface CacheEntry {
  data: InstagramMediaItem[]
  timestamp: number
}

// 30-minute in-memory cache to maintain high homepage performance
const CACHE_TTL_MS = 30 * 60 * 1000
let memoryCache: CacheEntry | null = null

export async function getRecentInstagramMedia(): Promise<InstagramFeedResult> {
  const profile = {
    handle: '@herprettythings',
    url: 'https://www.instagram.com/her_prettythings/',
  }

  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN?.trim()
  const accountId = (
    process.env.INSTAGRAM_USER_ID ||
    process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID ||
    '28158774550411939'
  )?.trim()

  // If official credentials are not yet configured in environment variables,
  // return configured: false gracefully without throwing or creating fake data.
  if (!accessToken) {
    return {
      configured: false,
      profile,
      data: [],
      message: 'Instagram integration requires INSTAGRAM_ACCESS_TOKEN.',
    }
  }

  // Return cached media if still fresh
  const now = Date.now()
  if (memoryCache && now - memoryCache.timestamp < CACHE_TTL_MS) {
    return {
      configured: true,
      profile,
      data: memoryCache.data,
    }
  }

  try {
    // Official Instagram Graph API endpoint for professional / creator accounts
    const fields = 'id,caption,media_type,media_product_type,thumbnail_url,media_url,permalink,timestamp'
    const targetId = accountId || '28158774550411939'
    const graphUrl = `https://graph.instagram.com/v25.0/${encodeURIComponent(targetId)}/media?fields=${fields}&limit=15&access_token=${encodeURIComponent(accessToken)}`

    const response = await fetch(graphUrl, {
      headers: {
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      console.warn(`[Instagram] Meta Graph API returned HTTP ${response.status}`)
      
      // If cached data exists (even if stale), serve it as resilient fallback
      if (memoryCache && memoryCache.data.length > 0) {
        return {
          configured: true,
          profile,
          data: memoryCache.data,
        }
      }

      return {
        configured: true,
        profile,
        data: [],
        message: 'Could not retrieve media from Instagram API at this time.',
      }
    }

    const payload: any = await response.json()
    const rawItems: any[] = Array.isArray(payload.data) ? payload.data : []

    // Sort newest-first
    const sorted = rawItems.sort((a, b) => {
      const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0
      const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0
      return timeB - timeA
    })

    // Filter to Reels (media_product_type === 'REELS' or VIDEO + REELS)
    const reels = sorted.filter(
      (item) => item.media_product_type === 'REELS' || (item.media_type === 'VIDEO' && item.media_product_type === 'REELS'),
    )
    const selected = (reels.length > 0 ? reels : sorted.filter((item) => item.media_type === 'VIDEO')).slice(0, 5)

    const formatted: InstagramMediaItem[] = selected.map((item) => ({
      id: item.id,
      caption: item.caption,
      mediaType: item.media_type || 'VIDEO',
      mediaUrl: item.media_url,
      thumbnailUrl: item.thumbnail_url || item.media_url || '',
      permalink: item.permalink || 'https://www.instagram.com/her_prettythings/',
      timestamp: item.timestamp || new Date().toISOString(),
    }))

    memoryCache = {
      data: formatted,
      timestamp: now,
    }

    return {
      configured: true,
      profile,
      data: formatted,
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[Instagram] Failed to fetch from Meta Graph API:', errorMsg)

    if (memoryCache && memoryCache.data.length > 0) {
      return {
        configured: true,
        profile,
        data: memoryCache.data,
      }
    }

    return {
      configured: true,
      profile,
      data: [],
      message: 'Failed to connect to Instagram API.',
    }
  }
}
