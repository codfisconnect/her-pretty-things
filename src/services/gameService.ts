import { apiRequest } from './api'

export interface GameRewardResponse {
  success: boolean
  alreadyClaimed: boolean
  reward?: {
    code: string
    rewardType: string
    rewardDescription: string
    expiresAt?: string
  }
  message: string
}

export async function claimGameRewardApi(data: {
  sessionId?: string
  userId?: string
  boardState: string[]
  winner: string
  difficulty: string
  movesCount: number
}): Promise<GameRewardResponse> {
  return await apiRequest<GameRewardResponse>('/game/reward', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function validateRewardCodeApi(code: string) {
  return await apiRequest<{
    valid: boolean
    code: string
    rewardType: string
    rewardDescription: string
  }>('/game/validate-reward', {
    method: 'POST',
    body: JSON.stringify({ code }),
  })
}
