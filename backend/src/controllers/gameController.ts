import type { Request, Response } from 'express'
import { claimGameReward, validateRewardCode } from '../services/gameService.js'

export async function claimReward(request: Request, response: Response) {
  const result = await claimGameReward(request.body)
  response.json(result)
}

export async function validateReward(request: Request, response: Response) {
  const code = String(request.body?.code || '')
  const result = await validateRewardCode(code)
  response.json({ success: true, data: result })
}
