import type { Request, Response } from 'express'
import { getActiveSeasonalGreeting } from '../services/seasonalGreetingService.js'

export async function getActiveGreeting(_request: Request, response: Response) {
  const greeting = await getActiveSeasonalGreeting()
  response.json({ success: true, data: greeting })
}
