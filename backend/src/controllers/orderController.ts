import type { Request, Response } from 'express'
import { HttpError } from '../middleware/errorHandler.js'
import { cancelOrder, createOrder, getOrder, listUserOrders, readCreateOrderInput } from '../services/orderService.js'

function readParam(request: Request, name: string): string {
  const value = request.params[name]
  if (typeof value !== 'string' || value.length === 0) throw new HttpError(400, `${name} is required.`)
  return value
}

export async function newOrder(request: Request, response: Response) {
  const order = await createOrder(readCreateOrderInput(request.body))
  response.status(201).json({ success: true, data: order })
}

export async function readOrder(request: Request, response: Response) {
  const order = await getOrder(readParam(request, 'orderId'))
  response.json({ success: true, data: order })
}

export async function readUserOrders(request: Request, response: Response) {
  const userId = readParam(request, 'userId')
  const orders = await listUserOrders(userId)
  response.json({ success: true, data: orders })
}

export async function cancelExistingOrder(request: Request, response: Response) {
  const order = await cancelOrder(readParam(request, 'orderId'))
  response.json({ success: true, data: order })
}