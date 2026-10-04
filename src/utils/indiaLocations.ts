import type { PincodeLookupResponse } from '../services/pincodeService'

export const INDIA_STATES_AND_UTS: string[] = [
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
]

export const STATE_ALIAS_MAP: Record<string, string> = {
  'delhi': 'Delhi',
  'nct of delhi': 'Delhi',
  'national capital territory of delhi': 'Delhi',
  'himachal praddesh': 'Himachal Pradesh',
  'himachal pradesh': 'Himachal Pradesh',
  'dadra and nagar haveli': 'Dadra and Nagar Haveli and Daman and Diu',
  'daman and diu': 'Dadra and Nagar Haveli and Daman and Diu',
  'dadra & nagar haveli and daman & diu': 'Dadra and Nagar Haveli and Daman and Diu',
  'dadra and nagar haveli and daman and diu': 'Dadra and Nagar Haveli and Daman and Diu',
  'odisha': 'Odisha',
  'orissa': 'Odisha',
  'pondicherry': 'Puducherry',
  'puducherry': 'Puducherry',
  'jammu and kashmir': 'Jammu and Kashmir',
  'jammu & kashmir': 'Jammu and Kashmir',
  'andaman and nicobar islands': 'Andaman and Nicobar Islands',
  'andaman & nicobar islands': 'Andaman and Nicobar Islands',
  'andaman and nicobar': 'Andaman and Nicobar Islands',
  'tamilnadu': 'Tamil Nadu',
  'tamil nadu': 'Tamil Nadu',
  'uttaranchal': 'Uttarakhand',
  'uttarakhand': 'Uttarakhand',
  'telengana': 'Telangana',
  'telangana': 'Telangana',
  'chhatisgarh': 'Chhattisgarh',
  'chhattisgarh': 'Chhattisgarh',
}

const CITY_ALIAS_MAP: Record<string, string[]> = {
  'bengaluru': ['bangalore', 'bengaluru urban', 'bengaluru rural', 'bangalore urban', 'bangalore rural'],
  'bangalore': ['bengaluru', 'bengaluru urban', 'bengaluru rural', 'bangalore urban', 'bangalore rural'],
  'mumbai': ['bombay', 'mumbai suburban', 'mumbai city'],
  'bombay': ['mumbai', 'mumbai suburban', 'mumbai city'],
  'chennai': ['madras'],
  'madras': ['chennai'],
  'kolkata': ['calcutta'],
  'calcutta': ['kolkata'],
  'varanasi': ['banaras', 'benares', 'kashi'],
  'prayagraj': ['allahabad'],
  'allahabad': ['prayagraj'],
  'kozhikode': ['calicut'],
  'calicut': ['kozhikode'],
  'thiruvananthapuram': ['trivandrum'],
  'trivandrum': ['thiruvananthapuram'],
  'kochi': ['cochin', 'ernakulam'],
  'cochin': ['kochi', 'ernakulam'],
  'ernakulam': ['kochi', 'cochin'],
  'puducherry': ['pondicherry'],
  'pondicherry': ['puducherry'],
  'gurugram': ['gurgaon'],
  'gurgaon': ['gurugram'],
  'visakhapatnam': ['vizag', 'waltair'],
  'vizag': ['visakhapatnam'],
  'mysuru': ['mysore'],
  'mysore': ['mysuru'],
  'manguluru': ['mangalore'],
  'mangaluru': ['mangalore'],
  'mangalore': ['mangaluru'],
  'belagavi': ['belgaum'],
  'belgaum': ['belagavi'],
  'vijayawada': ['bezawada'],
  'kalaburagi': ['gulbarga'],
  'gulbarga': ['kalaburagi'],
  'shimla': ['simla'],
  'panaji': ['panjim'],
  'panjim': ['panaji'],
}

// In-memory cache for lazily loaded location dataset
let cachedLocations: Record<string, string[]> | null = null
let pendingLoad: Promise<Record<string, string[]>> | null = null

export async function fetchLocationsData(): Promise<Record<string, string[]>> {
  if (cachedLocations) return cachedLocations
  if (pendingLoad) return pendingLoad

  pendingLoad = (async () => {
    try {
      const response = await fetch('/data/indiaLocations.json')
      if (response.ok) {
        const data = (await response.json()) as Record<string, string[]>
        cachedLocations = data
        return data
      }
    } catch {
      // Fallback to dynamic import if fetch fails
    }

    const module = await import('../data/indiaLocations.json')
    cachedLocations = (module.default || module) as Record<string, string[]>
    return cachedLocations
  })()

  return pendingLoad
}

export function normalizeStateName(state: string): string {
  if (!state || typeof state !== 'string') return ''
  const trimmed = state.trim().toLowerCase().replace(/\s+/g, ' ')
  if (STATE_ALIAS_MAP[trimmed]) return STATE_ALIAS_MAP[trimmed]
  const match = INDIA_STATES_AND_UTS.find((s) => s.toLowerCase() === trimmed)
  return match || state.trim()
}

export function isValidState(state: string): boolean {
  const normalized = normalizeStateName(state)
  return INDIA_STATES_AND_UTS.includes(normalized)
}

export async function getCitiesForState(state: string): Promise<string[]> {
  const normalized = normalizeStateName(state)
  const data = await fetchLocationsData()
  const cities = data[normalized]
  return cities ? [...cities] : []
}

function cleanString(val: string): string {
  return val
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export interface ConsistencyCheckResult {
  stateMatches: boolean
  cityMatches: boolean
  stateErrorMessage?: string
  cityErrorMessage?: string
  isUncertainCityMatch?: boolean
}

export function checkAddressConsistency(
  selectedState: string,
  selectedCity: string,
  postalData: PincodeLookupResponse,
): ConsistencyCheckResult {
  const normSelectedState = normalizeStateName(selectedState)
  const normPostalState = normalizeStateName(postalData.state)

  const stateMatches =
    normSelectedState.toLowerCase() === normPostalState.toLowerCase()

  if (!stateMatches) {
    return {
      stateMatches: false,
      cityMatches: false,
      stateErrorMessage: `This pincode belongs to ${postalData.state}, not ${selectedState}.`,
    }
  }

  const cleanSelectedCity = cleanString(selectedCity)
  const cleanDistrict = cleanString(postalData.district || '')

  const candidateStrings: string[] = []
  if (cleanDistrict) candidateStrings.push(cleanDistrict)

  for (const po of postalData.postOffices || []) {
    if (po.name) candidateStrings.push(cleanString(po.name))
    if (po.district) candidateStrings.push(cleanString(po.district))
  }

  let directCityMatch = false
  for (const cand of candidateStrings) {
    if (
      cand === cleanSelectedCity ||
      cand.includes(cleanSelectedCity) ||
      cleanSelectedCity.includes(cand)
    ) {
      directCityMatch = true
      break
    }
  }

  let aliasCityMatch = false
  if (!directCityMatch) {
    const aliases = CITY_ALIAS_MAP[cleanSelectedCity] || []
    for (const alias of aliases) {
      const cleanAlias = cleanString(alias)
      for (const cand of candidateStrings) {
        if (
          cand === cleanAlias ||
          cand.includes(cleanAlias) ||
          cleanAlias.includes(cand)
        ) {
          aliasCityMatch = true
          break
        }
      }
      if (aliasCityMatch) break
    }
  }

  const cityMatches = directCityMatch || aliasCityMatch

  return {
    stateMatches: true,
    cityMatches,
    cityErrorMessage: cityMatches
      ? undefined
      : `The selected city does not match the postal district/area (${postalData.district}) for this pincode.`,
    isUncertainCityMatch: !cityMatches,
  }
}
