import type { Request, Response } from 'express'
import { clearAdminSession, createAdminSession, isAdminSessionValid } from '../middleware/adminAuth.js'
import { HttpError } from '../middleware/errorHandler.js'
import { getDashboard, getOrder, listOrders, updateOrderStatus } from '../services/adminService.js'

function readString(value: unknown, field: string) {
  if (typeof value !== 'string' || value.trim().length === 0) throw new HttpError(400, `${field} is required.`)
  return value.trim()
}

export function adminLogin(request: Request, response: Response) {
  const body = request.body as unknown
  if (typeof body !== 'object' || body === null) throw new HttpError(400, 'Login payload is required.')
  const record = body as Record<string, unknown>
  const email = readString(record.email, 'email')
  const password = readString(record.password, 'password')
  const configuredEmail = process.env.ADMIN_EMAIL
  const configuredPassword = process.env.ADMIN_PASSWORD
  if (!configuredEmail || !configuredPassword) throw new HttpError(500, 'Admin credentials are not configured.')
  if (email !== configuredEmail || password !== configuredPassword) throw new HttpError(401, 'Invalid admin credentials.')
  createAdminSession(response)
  response.json({ success: true, data: { email } })
}

export function adminLogout(_request: Request, response: Response) {
  clearAdminSession(response)
  response.json({ success: true })
}

export function adminSession(request: Request, response: Response) {
  response.json({ success: true, data: { authenticated: isAdminSessionValid(request) } })
}

export async function dashboard(_request: Request, response: Response) { response.json({ success: true, data: await getDashboard() }) }
export async function orders(_request: Request, response: Response) { response.json({ success: true, data: await listOrders() }) }

export async function orderDetails(request: Request, response: Response) {
  response.json({ success: true, data: await getOrder(readString(request.params.orderId, 'orderId')) })
}

export async function orderStatus(request: Request, response: Response) {
  const body = request.body as unknown
  if (typeof body !== 'object' || body === null) throw new HttpError(400, 'Status payload is required.')
  response.json({ success: true, data: await updateOrderStatus(readString(request.params.orderId, 'orderId'), readString((body as Record<string, unknown>).status, 'status')) })
}
