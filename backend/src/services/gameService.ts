import crypto from 'node:crypto'
import { getDatabase } from '../config/database.js'
import { HttpError } from '../middleware/errorHandler.js'

export interface ClaimRewardInput {
  sessionId?: string
  userId?: string
  boardState: string[] // 9 cells ('X', 'O', null)
  winner: string // 'X'
  difficulty: string // 'easy' | 'medium' | 'hard'
  movesCount: number
}

// Backend verification of Tic-Tac-Toe win
function verifyTicTacToeWinner(board: string[]): boolean {
  if (!Array.isArray(board) || board.length !== 9) return false

  const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6],             // diagonals
  ]

  for (const [a, b, c] of winPatterns) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a] === 'X' // Player must be X
    }
  }

  return false
}

export async function claimGameReward(input: ClaimRewardInput) {
  const database = getDatabase()

  if (!input.sessionId && !input.userId) {
    throw new HttpError(400, 'Session or user identification is required.')
  }

  // 1. Authoritative verification of game state
  const isLegitWin = verifyTicTacToeWinner(input.boardState)
  if (!isLegitWin || input.winner !== 'X' || input.movesCount < 3) {
    throw new HttpError(400, 'Invalid game state or win conditions not met.')
  }

  // 2. Prevent replay/abuse: check if user/session already claimed an active reward in the last 2 hours
  const twoHoursAgo = new Date(Date.now() - 2 * 3600 * 1000)
  const existingActive = await database.gameReward.findFirst({
    where: {
      sessionId: input.sessionId || undefined,
      userId: input.userId || undefined,
      status: 'ACTIVE',
      createdAt: { gte: twoHoursAgo },
    },
  })

  if (existingActive) {
    return {
      success: true,
      alreadyClaimed: true,
      reward: existingActive,
      message: 'You already have an active reward unlocked!',
    }
  }

  // 3. Generate unique reward code
  const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase()
  const code = `HPT-PEN-${randomSuffix}`
  const expiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1000) // 7 days validity

  const reward = await database.gameReward.create({
    data: {
      code,
      rewardType: 'CUTE_PEN',
      rewardDescription: 'One Cute Pen as a Free Gift',
      status: 'ACTIVE',
      sessionId: input.sessionId || null,
      userId: input.userId || null,
      difficulty: input.difficulty || 'medium',
      movesCount: input.movesCount,
      expiresAt,
    },
  })

  return {
    success: true,
    alreadyClaimed: false,
    reward: {
      code: reward.code,
      rewardType: reward.rewardType,
      rewardDescription: reward.rewardDescription,
      expiresAt: reward.expiresAt,
    },
    message: 'Congratulations! You unlocked One Cute Pen as a Free Gift!',
  }
}

export async function validateRewardCode(code: string) {
  const database = getDatabase()
  if (!code) throw new HttpError(400, 'Reward code is required.')

  const normalized = code.trim().toUpperCase()
  const reward = await database.gameReward.findUnique({
    where: { code: normalized },
  })

  if (!reward) {
    throw new HttpError(404, 'Invalid reward code.')
  }

  if (reward.status !== 'ACTIVE') {
    throw new HttpError(400, `This reward code is already ${reward.status.toLowerCase()}.`)
  }

  if (reward.expiresAt && new Date(reward.expiresAt) < new Date()) {
    throw new HttpError(400, 'This reward code has expired.')
  }

  return {
    valid: true,
    code: reward.code,
    rewardType: reward.rewardType,
    rewardDescription: reward.rewardDescription,
  }
}

export async function listAllRewards() {
  const database = getDatabase()
  return await database.gameReward.findMany({
    orderBy: { createdAt: 'desc' },
  })
}
