import type { Request, Response } from 'express'
import { HttpError } from '../middleware/errorHandler.js'
import { createOrder, getOrder, readCreateOrderInput } from '../services/orderService.js'

export async function createOrderController(request: Request, response: Response) {
  const order = await createOrder(readCreateOrderInput(request.body))
  response.status(201).json({ success: true, data: order })
}

export async function readOrder(request: Request, response: Response) {
  const orderId = request.params.orderId
  if (typeof orderId !== 'string' || orderId.length === 0) throw new HttpError(400, 'orderId is required.')
  const order = await getOrder(orderId)
  response.json({ success: true, data: order })
}
