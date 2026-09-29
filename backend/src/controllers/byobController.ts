import type { Request, Response } from 'express'
import { getByobSettings, getByobEligibleProducts } from '../services/byobService.js'

export async function fetchByobSettings(_request: Request, response: Response) {
  const settings = await getByobSettings()
  response.json({ success: true, data: settings })
}

export async function fetchByobProducts(_request: Request, response: Response) {
  const products = await getByobEligibleProducts()
  response.json({ success: true, data: products })
}
