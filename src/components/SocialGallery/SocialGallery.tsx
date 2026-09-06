import { ArrowUpRight, Camera } from 'lucide-react'
import { Link } from 'react-router-dom'

const tiles = [
  { className: 'social-tile-one', icon: '🎀', label: 'Sweet details' },
  { className: 'social-tile-two', icon: '✧', label: 'Pretty sparkle' },
  { className: 'social-tile-three', icon: '🐰', label: 'Kawaii joy' },
  { className: 'social-tile-four', icon: '♡', label: 'Made to love' },
  { className: 'social-tile-five', icon: '✿', label: 'Little moments' },
]

function SocialGallery() {
  return (
    <section className="social-section container">
      <div className="section-heading"><div><p className="eyebrow"><Camera size={14} /> Follow along</p><h2>Pretty Things You'll Love</h2></div><a className="text-link desktop-link" href="https://instagram.com" target="_blank" rel="noreferrer">@herprettythings <ArrowUpRight size={16} /></a></div>
      <div className="social-grid">{tiles.map((tile) => <Link className={`social-tile ${tile.className}`} to="/kawaii" key={tile.label} aria-label={`Explore ${tile.label}`}><span>{tile.icon}</span><small>{tile.label}</small></Link>)}</div>
    </section>
  )
}

export default SocialGallery
