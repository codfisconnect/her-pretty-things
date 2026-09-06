import { Gift, Heart, Sparkles } from 'lucide-react'

const features = [
  { icon: Sparkles, title: 'Carefully Curated', description: "Things chosen because they're simply pretty." },
  { icon: Gift, title: 'Beautifully Wrapped', description: 'Every order deserves a little extra love.' },
  { icon: Heart, title: 'Made to Delight', description: 'Little things that bring a little happiness.' },
]

function BrandExperience() {
  return (
    <section className="experience-section">
      <div className="container">
        <div className="experience-heading"><p className="eyebrow">The pretty things promise</p><h2>Made for little moments of joy</h2><p>Her Pretty Things brings together cute surprises, pretty jewellery, and Kawaii finds to make ordinary days feel a little more special.</p></div>
        <div className="experience-grid">{features.map(({ icon: Icon, title, description }) => <div className="experience-item" key={title}><span className="experience-icon"><Icon size={20} strokeWidth={1.6} /></span><div><h3>{title}</h3><p>{description}</p></div></div>)}</div>
      </div>
    </section>
  )
}

export default BrandExperience
