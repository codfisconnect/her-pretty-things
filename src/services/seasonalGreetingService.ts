import { apiRequest } from './api'

export interface SeasonalGreeting {
  id: string
  enabled: boolean
  characterName: string
  characterImage: string
  greeting: string
  secondaryText?: string | null
  startDate?: string | null
  endDate?: string | null
  displayFrequency: string
  animationStyle: string
  displayDuration: number
  ctaText?: string | null
  ctaLink?: string | null
  priority: number
}

export async function fetchActiveGreeting(): Promise<SeasonalGreeting | null> {
  try {
    const res = await apiRequest<SeasonalGreeting | null>('/seasonal-greeting/active')
    return res
  } catch {
    // Fallback default campaign
    return {
      id: 'greeting-hello-kitty',
      enabled: true,
      characterName: 'Hello Kitty',
      characterImage: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=400&q=80',
      greeting: 'Hi! Welcome to Her Pretty Things ♡',
      secondaryText: 'Discover tiny delights, aesthetic jewellery, and custom curated boxes!',
      displayFrequency: 'once_per_session',
      animationStyle: 'bounce',
      displayDuration: 8,
      ctaText: 'Build Your Own Box',
      ctaLink: '/byob',
      priority: 1,
    }
  }
}
