import { INDIA_LOCATIONS } from '../data/indiaLocationsData.js'
import {
  type PincodeLookupResult,
  type PostOfficeInfo,
  normalizeStateName,
} from '../utils/indiaLocations.js'

interface CacheEntry {
  data: PincodeLookupResult | null
  expiresAt: number
}

// In-memory bounded cache with 24 hours TTL for valid, 10 minutes for invalid
const pincodeCache = new Map<string, CacheEntry>()
const MAX_CACHE_SIZE = 1000
const VALID_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours
const INVALID_TTL_MS = 10 * 60 * 1000 // 10 minutes

function getFromCache(pincode: string): { found: boolean; data: PincodeLookupResult | null } {
  const entry = pincodeCache.get(pincode)
  if (!entry) return { found: false, data: null }
  if (Date.now() > entry.expiresAt) {
    pincodeCache.delete(pincode)
    return { found: false, data: null }
  }
  return { found: true, data: entry.data }
}

function setToCache(pincode: string, data: PincodeLookupResult | null, ttlMs: number) {
  if (pincodeCache.size >= MAX_CACHE_SIZE) {
    // Evict oldest 100 entries
    const keys = Array.from(pincodeCache.keys()).slice(0, 100)
    for (const k of keys) {
      pincodeCache.delete(k)
    }
  }
  pincodeCache.set(pincode, {
    data,
    expiresAt: Date.now() + ttlMs,
  })
}

interface IndiaPostOfficeRaw {
  Name?: string
  BranchType?: string
  DeliveryStatus?: string
  Circle?: string
  District?: string
  Division?: string
  Region?: string
  Block?: string
  State?: string
  Country?: string
  Pincode?: string
}

interface IndiaPostalApiResponse {
  Message?: string
  Status?: string
  PostOffice?: IndiaPostOfficeRaw[] | null
}

export async function lookupPincode(pincode: string): Promise<PincodeLookupResult | null> {
  const cleanPincode = pincode.trim()
  if (!/^[1-9][0-9]{5}$/.test(cleanPincode)) {
    return null
  }

  const cached = getFromCache(cleanPincode)
  if (cached.found) {
    return cached.data
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 6000)

    const response = await fetch(`https://api.postalpincode.in/pincode/${cleanPincode}`, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'HerPrettyThings/1.0',
      },
    })
    clearTimeout(timeoutId)

    if (!response.ok) {
      // Don't cache transient server errors (5xx/429)
      return null
    }

    const payload = (await response.json()) as IndiaPostalApiResponse[]
    if (
      !Array.isArray(payload) ||
      payload.length === 0 ||
      payload[0].Status !== 'Success' ||
      !Array.isArray(payload[0].PostOffice) ||
      payload[0].PostOffice.length === 0
    ) {
      // Pincode not found / invalid according to postal directory
      setToCache(cleanPincode, null, INVALID_TTL_MS)
      return null
    }

    const postOfficesRaw = payload[0].PostOffice
    const firstPo = postOfficesRaw[0]
    const rawState = firstPo.State || ''
    const rawDistrict = firstPo.District || ''

    const normalizedState = normalizeStateName(rawState)

    const postOffices: PostOfficeInfo[] = postOfficesRaw.map((po) => ({
      name: (po.Name || '').trim(),
      branchType: (po.BranchType || '').trim(),
      deliveryStatus: (po.DeliveryStatus || '').trim(),
      district: (po.District || '').trim(),
      state: normalizeStateName(po.State || ''),
    }))

    const result: PincodeLookupResult = {
      valid: true,
      pincode: cleanPincode,
      state: normalizedState,
      district: rawDistrict.trim(),
      postOffices,
    }

    setToCache(cleanPincode, result, VALID_TTL_MS)
    return result
  } catch (err: any) {
    console.warn(`[PincodeService] Postal API lookup failed for ${cleanPincode}:`, err?.message || err)
    return null
  }
}
