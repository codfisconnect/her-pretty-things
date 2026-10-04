import { INDIA_LOCATIONS } from '../data/indiaLocationsData.js'

export interface PostOfficeInfo {
  name: string
  branchType: string
  deliveryStatus: string
  district?: string
  state?: string
}

export interface PincodeLookupResult {
  valid: boolean
  pincode: string
  state: string
  district: string
  postOffices: PostOfficeInfo[]
}

export const INDIA_STATES_AND_UTS: string[] = Object.keys(INDIA_LOCATIONS).sort((a, b) =>
  a.localeCompare(b),
)

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

export function getCitiesForState(state: string): string[] {
  const normalized = normalizeStateName(state)
  const cities = INDIA_LOCATIONS[normalized]
  return cities ? [...cities] : []
}

export function isValidCityForState(city: string, state: string): boolean {
  if (!city || !state) return false
  const validCities = getCitiesForState(state)
  if (validCities.length === 0) return false
  const target = city.trim().toLowerCase()
  return validCities.some((c) => c.toLowerCase() === target)
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
  postalData: PincodeLookupResult,
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

  // Direct match or substring match (e.g. "Chennai" matching "Chennai GPO" or "Chennai South")
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

  // Alias match (e.g. Bangalore vs Bengaluru)
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
