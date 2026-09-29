import type { Request, Response } from 'express'
import { getRecentInstagramMedia } from '../services/instagramService.js'

export async function fetchInstagramFeed(_req: Request, res: Response) {
  try {
    const result = await getRecentInstagramMedia()
    res.json({
      success: true,
      configured: result.configured,
      profile: result.profile,
      data: result.data,
      message: result.message,
    })
  } catch (error: any) {
    console.error('Error in fetchInstagramFeed controller:', error)
    res.status(500).json({
      success: false,
      configured: false,
      profile: {
        handle: '@herprettythings',
        url: 'https://www.instagram.com/her_prettythings/',
      },
      data: [],
      message: 'Internal server error while retrieving Instagram media.',
    })
  }
}
