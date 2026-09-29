import type { Request, Response } from 'express'
import { getWishlist, toggleWishlist, mergeGuestWishlist } from '../services/wishlistService.js'

export async function fetchWishlist(request: Request, response: Response) {
  const userId = typeof request.query.userId === 'string' ? request.query.userId : undefined
  const sessionId = typeof request.query.sessionId === 'string' ? request.query.sessionId : undefined

  const items = await getWishlist({ userId, sessionId })
  response.json({ success: true, data: items })
}

export async function handleToggle(request: Request, response: Response) {
  const { productId, userId, sessionId } = request.body
  const result = await toggleWishlist({ productId, userId, sessionId })
  response.json({ success: true, data: result })
}

export async function handleMerge(request: Request, response: Response) {
  const { userId, productIds } = request.body
  const result = await mergeGuestWishlist({ userId, productIds })
  response.json({ success: true, data: result })
}
