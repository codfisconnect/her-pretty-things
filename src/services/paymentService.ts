import { apiRequest } from './api'

export interface CreatePaymentResponse {
  orderId: string
  razorpayOrderId: string
  amount: number
  currency: string
  keyId: string
}

export interface VerifyPaymentRequest {
  orderId: string
  razorpayOrderId: string
  razorpayPaymentId: string
  razorpaySignature: string
}

export interface VerifyPaymentResponse {
  orderId: string
  paymentStatus: string
  orderStatus: string
  razorpayOrderId: string
  razorpayPaymentId: string
}

export function createPayment(orderId: string) {
  return apiRequest<CreatePaymentResponse>('/payments/create', {
    method: 'POST',
    body: JSON.stringify({ orderId }),
  })
}

export function verifyPayment(request: VerifyPaymentRequest) {
  return apiRequest<VerifyPaymentResponse>('/payments/verify', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}
