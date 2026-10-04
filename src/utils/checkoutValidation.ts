export interface AddressValidationResult {
  isValid: boolean
  errors: {
    fullName?: string
    email?: string
    phoneNumber?: string
    addressLine1?: string
    addressLine2?: string
    state?: string
    city?: string
    pincode?: string
  }
}

export function validateFullName(name: string): string | null {
  const trimmed = name.trim()
  if (!trimmed) {
    return 'Full Name is required.'
  }
  if (trimmed.length < 2 || trimmed.length > 80) {
    return 'Please enter a valid full name (2 to 80 characters).'
  }
  const hasLetters = /\p{L}/u.test(trimmed)
  const isValidFormat = /^[\p{L}\s.'-]{2,80}$/u.test(trimmed)
  if (!hasLetters || !isValidFormat) {
    return 'Please enter a valid full name.'
  }
  return null
}

export function validateEmail(email: string): string | null {
  const trimmed = email.trim()
  if (!trimmed) {
    return 'Email address is required.'
  }
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/
  if (!emailRegex.test(trimmed)) {
    return 'Please enter a valid email address.'
  }
  return null
}

export function normalizeIndianPhone(input: string): string | null {
  const cleaned = input.trim().replace(/[\s\-()]/g, '')
  let digits = cleaned
  if (digits.startsWith('+91')) {
    digits = digits.slice(3)
  } else if (digits.startsWith('91') && digits.length === 12) {
    digits = digits.slice(2)
  } else if (digits.startsWith('0') && digits.length === 11) {
    digits = digits.slice(1)
  }

  if (/^[6-9]\d{9}$/.test(digits)) {
    return digits
  }
  return null
}

export function validatePhone(phone: string): string | null {
  const normalized = normalizeIndianPhone(phone)
  if (!normalized) {
    return 'Please enter a valid 10-digit Indian mobile number.'
  }
  return null
}

export function validateAddressLine1(addressLine1: string): string | null {
  const trimmed = addressLine1.trim()
  if (!trimmed) {
    return 'Address Line 1 is required.'
  }
  if (trimmed.length < 3 || trimmed.length > 120) {
    return 'Address Line 1 must be between 3 and 120 characters.'
  }
  const hasAlphanumeric = /[\p{L}\p{N}]/u.test(trimmed)
  const isValidChars = /^[\p{L}\p{N}\s,.'\-/\\#&()]{3,120}$/u.test(trimmed)
  if (!hasAlphanumeric || !isValidChars) {
    return 'Address Line 1 contains invalid characters.'
  }
  return null
}

export function validateAddressLine2(addressLine2?: string): string | null {
  if (!addressLine2) return null
  const trimmed = addressLine2.trim()
  if (!trimmed) return null
  if (trimmed.length > 120) {
    return 'Address Line 2 cannot exceed 120 characters.'
  }
  const hasAlphanumeric = /[\p{L}\p{N}]/u.test(trimmed)
  const isValidChars = /^[\p{L}\p{N}\s,.'\-/\\#&()]{1,120}$/u.test(trimmed)
  if (!hasAlphanumeric || !isValidChars) {
    return 'Address Line 2 contains invalid characters.'
  }
  return null
}

export function validatePincodeFormat(pincode: string): string | null {
  const clean = pincode.trim().replace(/\s+/g, '')
  if (!clean) {
    return 'Pincode is required.'
  }
  if (!/^[1-9][0-9]{5}$/.test(clean)) {
    return 'Please enter a valid 6-digit pincode.'
  }
  return null
}
