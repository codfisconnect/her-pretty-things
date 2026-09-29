import { getDatabase } from '../config/database.js'
import { HttpError } from '../middleware/errorHandler.js'

export async function getActiveSeasonalGreeting() {
  const database = getDatabase()
  const greeting = await database.seasonalGreeting.findFirst({
    where: { enabled: true },
    orderBy: { priority: 'desc' },
  })

  if (!greeting) return null

  const now = new Date()
  if (greeting.startDate && new Date(greeting.startDate) > now) return null
  if (greeting.endDate && new Date(greeting.endDate) < now) return null

  return greeting
}

export async function listSeasonalGreetings() {
  const database = getDatabase()
  return await database.seasonalGreeting.findMany({
    orderBy: { priority: 'desc' },
  })
}

export async function createSeasonalGreeting(data: any) {
  const database = getDatabase()
  if (!data.characterName || !data.characterImage || !data.greeting) {
    throw new HttpError(400, 'characterName, characterImage, and greeting are required.')
  }

  return await database.seasonalGreeting.create({
    data: {
      characterName: data.characterName.trim(),
      characterImage: data.characterImage.trim(),
      greeting: data.greeting.trim(),
      secondaryText: data.secondaryText?.trim() || null,
      enabled: data.enabled !== undefined ? Boolean(data.enabled) : true,
      displayFrequency: data.displayFrequency || 'once_per_session',
      animationStyle: data.animationStyle || 'bounce',
      displayDuration: Number(data.displayDuration) || 8,
      ctaText: data.ctaText?.trim() || null,
      ctaLink: data.ctaLink?.trim() || null,
      priority: Number(data.priority) || 1,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
    },
  })
}

export async function updateSeasonalGreeting(id: string, data: any) {
  const database = getDatabase()
  return await database.seasonalGreeting.update({
    where: { id },
    data: {
      characterName: data.characterName?.trim(),
      characterImage: data.characterImage?.trim(),
      greeting: data.greeting?.trim(),
      secondaryText: data.secondaryText !== undefined ? data.secondaryText?.trim() : undefined,
      enabled: data.enabled !== undefined ? Boolean(data.enabled) : undefined,
      displayFrequency: data.displayFrequency,
      animationStyle: data.animationStyle,
      displayDuration: data.displayDuration !== undefined ? Number(data.displayDuration) : undefined,
      ctaText: data.ctaText !== undefined ? data.ctaText?.trim() : undefined,
      ctaLink: data.ctaLink !== undefined ? data.ctaLink?.trim() : undefined,
      priority: data.priority !== undefined ? Number(data.priority) : undefined,
      startDate: data.startDate !== undefined ? (data.startDate ? new Date(data.startDate) : null) : undefined,
      endDate: data.endDate !== undefined ? (data.endDate ? new Date(data.endDate) : null) : undefined,
    },
  })
}

export async function deleteSeasonalGreeting(id: string) {
  const database = getDatabase()
  return await database.seasonalGreeting.delete({
    where: { id },
  })
}
