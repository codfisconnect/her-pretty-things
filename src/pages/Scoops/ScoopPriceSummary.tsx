import { Check, Sparkles } from 'lucide-react'
import { calculateScoopPrice, scoopPricing } from './scoopPricing'

interface ScoopPriceSummaryProps {
  numberOfScoops: number | ''
}

function formatPrice(value: number) {
  return `₹${value.toLocaleString('en-IN')}`
}

function ScoopPriceSummary({ numberOfScoops }: ScoopPriceSummaryProps) {
  const price = calculateScoopPrice(numberOfScoops === '' ? 0 : numberOfScoops)
  const additionalCount = numberOfScoops === '' ? 0 : Math.max(numberOfScoops - 1, 0)

  return (
    <aside className="scoop-summary" aria-label="Scoop price summary">
      <div className="summary-header"><span className="summary-icon"><Sparkles size={18} /></span><div><p className="summary-kicker">Your pretty order</p><h2>Scoop Configuration</h2></div></div>
      <div className="summary-selection"><span>Number of Scoops</span><strong>{numberOfScoops === '' ? 'Not selected' : numberOfScoops}</strong></div>
      <div className="summary-lines">
        <div><span>First Scoop</span><strong>{formatPrice(numberOfScoops === '' ? 0 : scoopPricing.firstScoop)}</strong></div>
        <div><span>Additional Scoops</span><strong>{additionalCount} × {formatPrice(scoopPricing.additionalScoop)} = {formatPrice(price.additionalScoopsTotal)}</strong></div>
      </div>
      <div className="summary-total-lines"><div><span>Subtotal</span><strong>{formatPrice(price.subtotal)}</strong></div><div><span>Shipping</span><strong>{formatPrice(price.shipping)}</strong></div></div>
      <div className="summary-total"><span>Total</span><strong>{formatPrice(price.total)}</strong></div>
      <p className="summary-note"><Check size={14} /> Flat ₹150 shipping per order</p>
    </aside>
  )
}

export default ScoopPriceSummary
