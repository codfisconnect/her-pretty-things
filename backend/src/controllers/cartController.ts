import type { Request, Response } from 'express'
import { HttpError } from '../middleware/errorHandler.js'
import { addCartItem, getCart, readAddCartItemInput, readUpdateCartItemInput, removeCartItem, updateCartItem } from '../services/cartService.js'

function readParam(request: Request, name: string): string {
  const value = request.params[name]
  if (typeof value !== 'string' || value.length === 0) throw new HttpError(400, `${name} is required.`)
  return value
}

export async function createCartItem(request: Request, response: Response) {
  const cart = await addCartItem(readAddCartItemInput(request.body))
  response.status(201).json({ success: true, data: cart })
}

export async function readCart(request: Request, response: Response) {
  const cart = await getCart(readParam(request, 'cartId'))
  response.json({ success: true, data: cart })
}

export async function editCartItem(request: Request, response: Response) {
  const cart = await updateCartItem(readParam(request, 'itemId'), readUpdateCartItemInput(request.body))
  response.json({ success: true, data: cart })
}

export async function deleteCartItem(request: Request, response: Response) {
  const cart = await removeCartItem(readParam(request, 'itemId'))
  response.json({ success: true, data: cart })
}
