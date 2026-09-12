import type { Request, Response } from 'express'
import {
  createPayment as createRazorpayPayment,
  verifyPayment as verifyRazorpayPayment,
  handleWebhook as handleRazorpayWebhook,
} from '../services/paymentService.js'
import { HttpError } from '../middleware/errorHandler.js'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function readOrderId(body: unknown): string {
  if (!isRecord(body) || typeof body.orderId !== 'string' || body.orderId.length === 0) {
    throw new HttpError(400, 'orderId is required.')
  }

  return body.orderId
}

function readString(body: unknown, name: string): string {
  if (!isRecord(body) || typeof body[name] !== 'string' || body[name].length === 0) {
    throw new HttpError(400, `${name} is required.`)
  }

  return body[name]
}

export async function createPayment(request: Request, response: Response) {
  const result = await createRazorpayPayment(readOrderId(request.body))

  response.json({
    success: true,
    data: result,
  })
}

export async function verifyPayment(request: Request, response: Response) {
  const orderId = readOrderId(request.body)
  const razorpayOrderId = readString(request.body, 'razorpayOrderId')
  const razorpayPaymentId = readString(request.body, 'razorpayPaymentId')
  const razorpaySignature = readString(request.body, 'razorpaySignature')

  const result = await verifyRazorpayPayment(
    orderId,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  )

  response.json({
    success: true,
    data: result,
  })
}

export async function handleWebhook(request: Request, response: Response) {
  if (!Buffer.isBuffer(request.body)) {
    throw new HttpError(400, 'Webhook body must be provided as raw JSON.')
  }

  await handleRazorpayWebhook(request.body, request.headers['x-razorpay-signature'])

  response.json({
    success: true,
  })
}