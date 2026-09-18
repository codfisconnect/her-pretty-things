import type { Request, Response } from 'express'
import { getScoopConfig } from '../services/scoopService.js'

export async function getScoopConfigController(
  _req: Request,
  res: Response
) {
  try {
    const config = await getScoopConfig()

    res.json(config)
  } catch (error) {
    console.error('Failed to load scoop configuration:', error)

    res.status(500).json({
      message: 'Failed to load scoop configuration.',
    })
  }
}