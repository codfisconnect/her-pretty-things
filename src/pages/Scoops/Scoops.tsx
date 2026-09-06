import { Gift, Heart, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { addCartItem } from '../../services/cartService'
import ScoopCustomizer from './ScoopCustomizer'
import ScoopPriceSummary from './ScoopPriceSummary'
import type { ScoopConfiguration } from './scoopTypes'

function Scoops() {
  const [selectedScoops, setSelectedScoops] = useState<number | ''>('')
  const navigate = useNavigate()

  const handleConfigurationReady = async (configuration: ScoopConfiguration) => {
    const savedSessionId = localStorage.getItem('hpt_session_id') ?? crypto.randomUUID()
    localStorage.setItem('hpt_session_id', savedSessionId)
    const cart = await addCartItem({ sessionId: savedSessionId, scoopConfiguration: configuration })
    localStorage.setItem('hpt_cart_id', cart.id)
    navigate('/cart')
  }

  return (
    <main className="scoops-page">
      <section className="scoops-intro container">
        <div className="scoops-intro-copy"><p className="eyebrow"><Sparkles size={14} /> Collection 01 · Made for surprises</p><h1>Build Your <em>Pretty</em> Scoop</h1><p>Choose your preferences and we’ll create a scoop filled with pretty little surprises.</p></div>
        <div className="scoops-intro-art" aria-hidden="true"><div className="scoop-art-ring" /><div className="scoop-art-gift"><Gift size={54} strokeWidth={1.15} /></div><span className="scoop-art-star star-one">✦</span><span className="scoop-art-star star-two">✧</span><span className="scoop-art-heart"><Heart size={23} fill="currentColor" /></span></div>
      </section>
      <section className="scoop-builder container">
        <div className="scoop-builder-visual"><div className="scoop-visual-card"><div className="scoop-visual-circle"><span className="scoop-visual-ribbon">🎀</span><span className="scoop-visual-sparkle">✦</span><span className="scoop-visual-dot">·</span></div><p className="scoop-visual-label">A little box<br /><strong>full of joy</strong></p></div><div className="scoop-visual-caption"><span>01</span><p>Every scoop is thoughtfully packed with cute, useful, and unexpected little treasures.</p></div></div>
        <div className="scoop-builder-panel"><ScoopCustomizer onScoopCountChange={setSelectedScoops} onConfigurationReady={handleConfigurationReady} /><ScoopPriceSummary numberOfScoops={selectedScoops} /></div>
      </section>
    </main>
  )
}

export default Scoops
