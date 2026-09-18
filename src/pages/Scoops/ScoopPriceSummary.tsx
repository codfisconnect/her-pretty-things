import { useEffect, useState } from 'react'
import { Check, Sparkles } from 'lucide-react'
import { apiRequest } from '../../services/api'

interface ScoopPriceSummaryProps {
  numberOfScoops: number | ''
}

interface ScoopConfig {
  pricing: {
    firstScoop: number
    additionalScoop: number
  }
  shippingRules: {
    scoopCount: number
    shipping: number
  }[]
}

function formatPrice(value: number) {
  return `₹${value.toLocaleString('en-IN')}`
}

function ScoopPriceSummary({
  numberOfScoops,
}: ScoopPriceSummaryProps) {
  const [scoopConfig, setScoopConfig] =
    useState<ScoopConfig | null>(null)

  useEffect(() => {
    const loadScoopConfig = async () => {
      try {
        const data = await apiRequest<ScoopConfig>(
          '/scoop/config',
        )

        setScoopConfig(data)
      } catch (error) {
        console.error(
          'Failed to load Scoop pricing:',
          error,
        )
      }
    }

    loadScoopConfig()
  }, [])

  const selectedScoops =
    numberOfScoops === '' ? 0 : numberOfScoops

  const additionalCount =
    Math.max(selectedScoops - 1, 0)

  const firstScoopPrice =
    scoopConfig?.pricing.firstScoop ?? 0

  const additionalScoopPrice =
    scoopConfig?.pricing.additionalScoop ?? 0

  const additionalScoopsTotal =
    additionalCount * additionalScoopPrice

  const subtotal =
    selectedScoops === 0
      ? 0
      : firstScoopPrice + additionalScoopsTotal

  const shipping =
    scoopConfig?.shippingRules.find(
      (rule) =>
        rule.scoopCount === selectedScoops,
    )?.shipping ?? 0

  const total = subtotal + shipping

  const shippingLabel =
    selectedScoops === 0
      ? 'Shipping calculated at checkout'
      : `${formatPrice(shipping)} shipping for ${selectedScoops} ${selectedScoops === 1 ? 'scoop' : 'scoops'
      }`

  return (
    <aside
      className="scoop-summary"
      aria-label="Scoop price summary"
    >
      <div className="summary-header">
        <span className="summary-icon">
          <Sparkles size={18} />
        </span>

        <div>
          <p className="summary-kicker">
            Your pretty order
          </p>

          <h2>Scoop Configuration</h2>
        </div>
      </div>

      <div className="summary-selection">
        <span>Number of Scoops</span>

        <strong>
          {numberOfScoops === ''
            ? 'Not selected'
            : numberOfScoops}
        </strong>
      </div>

      <div className="summary-lines">
        <div>
          <span>First Scoop</span>

          <strong>
            {formatPrice(
              numberOfScoops === ''
                ? 0
                : firstScoopPrice,
            )}
          </strong>
        </div>

        <div>
          <span>Additional Scoops</span>

          <strong>
            {additionalCount} ×{' '}
            {formatPrice(additionalScoopPrice)} ={' '}
            {formatPrice(additionalScoopsTotal)}
          </strong>
        </div>
      </div>

      <div className="summary-total-lines">
        <div>
          <span>Subtotal</span>

          <strong>
            {formatPrice(subtotal)}
          </strong>
        </div>

        <div>
          <span>Shipping</span>

          <strong>
            {formatPrice(shipping)}
          </strong>
        </div>
      </div>

      <div className="summary-total">
        <span>Total</span>

        <strong>
          {formatPrice(total)}
        </strong>
      </div>

      <p className="summary-note">
        <Check size={14} /> {shippingLabel}
      </p>
    </aside>
  )
}

export default ScoopPriceSummary