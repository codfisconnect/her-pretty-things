import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { X, Sparkles, Heart } from 'lucide-react'
import { fetchActiveGreeting, type SeasonalGreeting } from '../../services/seasonalGreetingService'
import './SeasonalCharacterGreeting.css'

export const SeasonalCharacterGreeting: React.FC = () => {
  const [greeting, setGreeting] = useState<SeasonalGreeting | null>(null)
  const [visible, setVisible] = useState(false)
  const [closed, setClosed] = useState(false)

  useEffect(() => {
    let timer: any

    async function checkGreeting() {
      try {
        const active = await fetchActiveGreeting()
        if (!active || !active.enabled) return

        // Frequency check
        const freq = active.displayFrequency || 'once_per_session'
        const campaignId = active.id

        if (freq === 'once_per_session') {
          if (sessionStorage.getItem(`hpt_greeting_${campaignId}`)) return
        } else if (freq === 'once_per_day') {
          const today = new Date().toISOString().split('T')[0]
          if (localStorage.getItem(`hpt_greeting_${campaignId}`) === today) return
        } else if (freq === 'once_during_campaign') {
          if (localStorage.getItem(`hpt_greeting_camp_${campaignId}`)) return
        }

        setGreeting(active)

        // Enter animation delay
        timer = setTimeout(() => {
          setVisible(true)
        }, 1200)

        // Mark shown
        if (freq === 'once_per_session') {
          sessionStorage.setItem(`hpt_greeting_${campaignId}`, 'true')
        } else if (freq === 'once_per_day') {
          const today = new Date().toISOString().split('T')[0]
          localStorage.setItem(`hpt_greeting_${campaignId}`, today)
        } else if (freq === 'once_during_campaign') {
          localStorage.setItem(`hpt_greeting_camp_${campaignId}`, 'true')
        }
      } catch (err) {
        console.error('Greeting check failed:', err)
      }
    }

    checkGreeting()

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [])

  if (!greeting || !visible || closed) return null

  const handleClose = () => {
    setVisible(false)
    setTimeout(() => setClosed(true), 300)
  }

  return (
    <aside
      className={`seasonal-character-banner ${greeting.animationStyle || 'bounce'}`}
      role="complementary"
      aria-label={`${greeting.characterName} seasonal greeting`}
    >
      <div className="seasonal-greeting-card">
        {/* Character Image */}
        <div className="character-avatar-wrap">
          <img
            src={greeting.characterImage}
            alt={greeting.characterName}
            className="character-avatar"
            loading="lazy"
          />
          <span className="character-sparkle">
            <Sparkles size={13} />
          </span>
        </div>

        {/* Speech Bubble / Greeting Text */}
        <div className="character-speech-bubble">
          <button
            type="button"
            className="character-close-btn"
            onClick={handleClose}
            aria-label="Close seasonal greeting"
          >
            <X size={14} />
          </button>

          <div className="bubble-header">
            <strong>{greeting.characterName}</strong>
            <Heart size={12} color="#db2777" fill="#db2777" />
          </div>

          <p className="bubble-greeting">{greeting.greeting}</p>

          {greeting.secondaryText && (
            <p className="bubble-secondary">{greeting.secondaryText}</p>
          )}

          {greeting.ctaText && (
            <Link
              to={greeting.ctaLink || '/byob'}
              className="bubble-cta-link"
              onClick={handleClose}
            >
              {greeting.ctaText} →
            </Link>
          )}
        </div>
      </div>
    </aside>
  )
}

export default SeasonalCharacterGreeting
