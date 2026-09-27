import type { Request, Response } from 'express'
import {
  registerCustomer,
  loginCustomer,
  getCustomerProfile,
  updateCustomerProfile,
  requestPasswordReset,
  resetPassword,
} from '../services/authService.js'
import { HttpError } from '../middleware/errorHandler.js'

export async function register(request: Request, response: Response) {
  const result = await registerCustomer(request.body)
  response.status(201).json({ success: true, data: result })
}

export async function login(request: Request, response: Response) {
  const result = await loginCustomer(request.body)
  response.json({ success: true, data: result })
}

export async function getProfile(request: Request, response: Response) {
  const userId = typeof request.query.userId === 'string' ? request.query.userId : request.headers['x-user-id'] as string
  if (!userId) throw new HttpError(401, 'User ID is required.')
  const profile = await getCustomerProfile(userId)
  response.json({ success: true, data: profile })
}

export async function updateProfile(request: Request, response: Response) {
  const userId = typeof request.body.userId === 'string' ? request.body.userId : request.headers['x-user-id'] as string
  if (!userId) throw new HttpError(401, 'User ID is required.')
  const updated = await updateCustomerProfile(userId, request.body)
  response.json({ success: true, data: updated })
}

export async function forgotPassword(request: Request, response: Response) {
  const email = String(request.body?.email || '')
  const result = await requestPasswordReset(email)
  response.json(result)
}

export async function resetPasswordController(request: Request, response: Response) {
  const token = String(request.body?.token || '')
  const password = String(request.body?.password || '')
  const result = await resetPassword(token, password)
  response.json(result)
}
