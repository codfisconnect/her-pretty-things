import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

export const prisma = process.env.DATABASE_URL ? new PrismaClient() : null

export function getDatabase(): PrismaClient {
  if (!prisma) {
    throw new Error('DATABASE_URL is not configured. Add it to backend/.env before using database endpoints.')
  }
  return prisma
}
