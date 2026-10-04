import { apiRequest } from './api'

export interface PostOfficeInfo {
  name: string
  branchType: string
  deliveryStatus: string
  district?: string
  state?: string
}

export interface PincodeLookupResponse {
  valid: boolean
  pincode: string
  state: string
  district: string
  postOffices: PostOfficeInfo[]
}

export async function verifyPincodeApi(
  pincode: string,
  signal?: AbortSignal,
): Promise<PincodeLookupResponse> {
  const cleanPincode = pincode.trim().replace(/\s+/g, '')
  return apiRequest<PincodeLookupResponse>(`/pincode/${encodeURIComponent(cleanPincode)}`, {
    signal,
  })
}
