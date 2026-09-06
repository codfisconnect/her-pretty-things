import { ArrowRight, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

function Hero() {
  return (
    <section className="hero-section">
      <div className="hero-orbit orbit-one" />
      <div className="hero-orbit orbit-two" />
      <div className="hero-inner container">
        <div className="hero-copy">
          <p className="eyebrow"><Sparkles size={14} /> A little lovely, just for you</p>
          <h1>Find something <em>pretty</em> today.</h1>
          <p className="hero-text">Curated treasures, sweet surprises, and tiny pieces of joy for your everyday.</p>
          <div className="hero-actions">
            <Link className="button button-dark" to="/scoops">Shop Now <ArrowRight size={17} /></Link>
            <Link className="text-link" to="/kawaii">Explore Kawaii <ArrowRight size={16} /></Link>
          </div>
          <div className="hero-note"><span>♥</span> Made for gifting, keeping, and smiling</div>
        </div>
        <div className="hero-art" aria-label="Illustration of a pink gift box with a bow" role="img">
          <div className="sparkle sparkle-a">✦</div><div className="sparkle sparkle-b">✧</div><div className="sparkle sparkle-c">·</div>
          <div className="art-shadow" />
          <div className="gift-box"><div className="gift-lid" /><div className="gift-body"><span className="ribbon vertical" /><span className="ribbon horizontal" /></div><div className="gift-bow"><span /><span /></div></div>
          <div className="art-label">Pretty little<br /><strong>surprises</strong></div>
        </div>
      </div>
    </section>
  )
}

export default Hero
