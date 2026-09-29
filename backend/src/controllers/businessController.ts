import type { Request, Response } from 'express'
import { getBusinessInfo, submitDamageClaim } from '../services/businessService.js'

export async function fetchBusinessInfo(_request: Request, response: Response) {
  const info = await getBusinessInfo()
  response.json({ success: true, data: info })
}

export async function handleDamageClaim(request: Request, response: Response) {
  const claim = await submitDamageClaim(request.body)
  response.status(201).json({
    success: true,
    data: claim,
    message: 'Your transit damage report has been submitted. Our team will review your unboxing video and respond shortly.',
  })
}
