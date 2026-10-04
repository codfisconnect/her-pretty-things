import { HttpError } from '../middleware/errorHandler.js'
import {
  isValidCityForState,
  isValidState,
  normalizeStateName,
} from './indiaLocations.js'
import type { ShippingInput } from '../services/orderService.js'

export interface ValidatedShippingDetails {
  fullName: string
  phoneNumber: string
  email: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  pincode: string
}

export function validateFullName(name: unknown): string {
  if (typeof name !== 'string') {
    throw new HttpError(400, 'Full Name is required.')
  }
  const trimmed = name.trim()
  if (trimmed.length < 2 || trimmed.length > 80) {
    throw new HttpError(400, 'Please enter a valid full name (2 to 80 characters).')
  }
  const hasLetters = /\p{L}/u.test(trimmed)
  const isValidFormat = /^[\p{L}\s.'-]{2,80}$/u.test(trimmed)
  if (!hasLetters || !isValidFormat) {
    throw new HttpError(400, 'Please enter a valid full name.')
  }
  return trimmed
}

export function validateEmail(email: unknown): string {
  if (typeof email !== 'string') {
    throw new HttpError(400, 'Email address is required.')
  }
  const trimmed = email.trim().toLowerCase()
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/
  if (!emailRegex.test(trimmed)) {
    throw new HttpError(400, 'Please enter a valid email address.')
  }
  return trimmed
}

export function normalizeAndValidatePhone(phone: unknown): string {
  if (typeof phone !== 'string') {
    throw new HttpError(400, 'Phone number is required.')
  }
  const cleaned = phone.trim().replace(/[\s\-()]/g, '')
  let digits = cleaned
  if (digits.startsWith('+91')) {
    digits = digits.slice(3)
  } else if (digits.startsWith('91') && digits.length === 12) {
    digits = digits.slice(2)
  } else if (digits.startsWith('0') && digits.length === 11) {
    digits = digits.slice(1)
  }

  if (!/^[6-9]\d{9}$/.test(digits)) {
    throw new HttpError(400, 'Please enter a valid 10-digit Indian mobile number.')
  }
  return digits
}

export function validateAddressLine1(addressLine1: unknown): string {
  if (typeof addressLine1 !== 'string') {
    throw new HttpError(400, 'Address Line 1 is required.')
  }
  const trimmed = addressLine1.trim()
  if (trimmed.length < 3 || trimmed.length > 120) {
    throw new HttpError(400, 'Address Line 1 must be between 3 and 120 characters.')
  }
  const hasAlphanumeric = /[\p{L}\p{N}]/u.test(trimmed)
  const isValidChars = /^[\p{L}\p{N}\s,.'\-/\\#&()]{3,120}$/u.test(trimmed)
  if (!hasAlphanumeric || !isValidChars) {
    throw new HttpError(400, 'Address Line 1 contains invalid characters.')
  }
  return trimmed
}

export function validateAddressLine2(addressLine2: unknown): string | undefined {
  if (addressLine2 === undefined || addressLine2 === null) return undefined
  if (typeof addressLine2 !== 'string') return undefined
  const trimmed = addressLine2.trim()
  if (trimmed.length === 0) return undefined
  if (trimmed.length > 120) {
    throw new HttpError(400, 'Address Line 2 cannot exceed 120 characters.')
  }
  const hasAlphanumeric = /[\p{L}\p{N}]/u.test(trimmed)
  const isValidChars = /^[\p{L}\p{N}\s,.'\-/\\#&()]{1,120}$/u.test(trimmed)
  if (!hasAlphanumeric || !isValidChars) {
    throw new HttpError(400, 'Address Line 2 contains invalid characters.')
  }
  return trimmed
}

export function validatePincodeFormat(pincode: unknown): string {
  if (typeof pincode !== 'string') {
    throw new HttpError(400, 'Pincode is required.')
  }
  const cleanPincode = pincode.trim().replace(/\s+/g, '')
  if (!/^[1-9][0-9]{5}$/.test(cleanPincode)) {
    throw new HttpError(400, 'Please enter a valid 6-digit pincode.')
  }
  return cleanPincode
}

export function validateStateAndCity(
  stateInput: unknown,
  cityInput: unknown,
): { state: string; city: string } {
  if (typeof stateInput !== 'string' || stateInput.trim().length === 0) {
    throw new HttpError(400, 'Please select a state or union territory.')
  }
  const normalizedState = normalizeStateName(stateInput)
  if (!isValidState(normalizedState)) {
    throw new HttpError(400, `"${stateInput}" is not a valid Indian State or Union Territory.`)
  }

  if (typeof cityInput !== 'string' || cityInput.trim().length === 0) {
    throw new HttpError(400, 'Please select a city.')
  }
  const normalizedCity = cityInput.trim()
  if (!isValidCityForState(normalizedCity, normalizedState)) {
    throw new HttpError(
      400,
      `"${normalizedCity}" is not a recognized city in ${normalizedState}. Please select a valid city from the list.`,
    )
  }

  return { state: normalizedState, city: normalizedCity }
}

export function validateAndNormalizeShipping(raw: unknown): ValidatedShippingDetails {
  if (typeof raw !== 'object' || raw === null) {
    throw new HttpError(400, 'shipping is required and must be an object.')
  }
  const shipping = raw as Record<string, unknown>

  const fullName = validateFullName(shipping.fullName)
  const email = validateEmail(shipping.email)
  const phoneNumber = normalizeAndValidatePhone(shipping.phoneNumber)
  const addressLine1 = validateAddressLine1(shipping.addressLine1)
  const addressLine2 = validateAddressLine2(shipping.addressLine2)
  const pincode = validatePincodeFormat(shipping.pincode)
  const { state, city } = validateStateAndCity(shipping.state, shipping.city)

  return {
    fullName,
    email,
    phoneNumber,
    addressLine1,
    addressLine2,
    city,
    state,
    pincode,
  }
}
