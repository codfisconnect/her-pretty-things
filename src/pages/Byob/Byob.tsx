import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Gift, Sparkles, Plus, Minus, Trash2, ShoppingBag, X } from 'lucide-react'
import { fetchByobProducts, fetchByobSettings, type ByobSettings } from '../../services/byobService'
import { useCart } from '../../context/CartContext'
import type { Product } from '../../types/product'
import { optimizeCloudinaryImage } from '../../utils/cloudinary'
import './Byob.css'

interface BoxItem {
  product: Product
  quantity: number
}

const Byob: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [settings, setSettings] = useState<ByobSettings>({
    id: 'default',
    enabled: true,
    minimumSubtotal: 1000,
    shippingFee: 150,
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'kawaii' | 'jewellery'>('all')
  const [boxItems, setBoxItems] = useState<BoxItem[]>([])
  const [boxReact, setBoxReact] = useState(false)
  const [addingToCart, setAddingToCart] = useState(false)
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)

  // Lock background scrolling when mobile drawer is open
  useEffect(() => {
    if (mobileDrawerOpen) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = originalOverflow
      }
    }
  }, [mobileDrawerOpen])

  const { addToCart, closeDrawer } = useCart()
  const navigate = useNavigate()

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const [prods, sett] = await Promise.all([
          fetchByobProducts(),
          fetchByobSettings(),
        ])
        setProducts(prods)
        setSettings(sett)
      } catch (err) {
        console.error('Failed to load BYOB data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Category normalizer for consistent filtering & counting
  const normalizeCat = (cat?: string): string => {
    const c = (cat || '').trim().toLowerCase()
    return c === 'jewelry' ? 'jewellery' : c
  }

  // Eligible BYOB items (Kawaii & Jewellery)
  const eligibleProducts = useMemo(() => {
    return products.filter((p) => {
      const cat = normalizeCat(p.category)
      return cat === 'kawaii' || cat === 'jewellery'
    })
  }, [products])

  // Dynamic category counts directly derived from backend dataset
  const categoryCounts = useMemo(() => {
    return {
      all: eligibleProducts.length,
      kawaii: eligibleProducts.filter((p) => normalizeCat(p.category) === 'kawaii').length,
      jewellery: eligibleProducts.filter((p) => normalizeCat(p.category) === 'jewellery').length,
    }
  }, [eligibleProducts])

  // Filter products by tab
  const filteredProducts = useMemo(() => {
    if (activeTab === 'all') return eligibleProducts
    return eligibleProducts.filter((p) => normalizeCat(p.category) === activeTab)
  }, [eligibleProducts, activeTab])

  // Box calculations
  const boxSubtotal = useMemo(() => {
    return boxItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  }, [boxItems])

  const totalQuantityInBox = useMemo(() => {
    return boxItems.reduce((sum, item) => sum + item.quantity, 0)
  }, [boxItems])

  const minRequired = settings.minimumSubtotal || 1000
  const isMinimumReached = boxSubtotal >= minRequired
  const remaining = Math.max(0, minRequired - boxSubtotal)
  const progressPercent = Math.min(100, Math.round((boxSubtotal / minRequired) * 100))
  const boxTotal = boxSubtotal + (isMinimumReached ? settings.shippingFee : 0)

  // Add product to box (respects product stock)
  const handleAddToBox = (product: Product) => {
    if (product.stock <= 0) return

    setBoxItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id)
      if (existing) {
        if (existing.quantity >= product.stock) {
          return prev
        }
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...prev, { product, quantity: 1 }]
    })

    // Trigger box bounce animation
    setBoxReact(true)
    setTimeout(() => setBoxReact(false), 500)
  }

  // Update item quantity in box (respects max product stock)
  const handleUpdateBoxQty = (productId: string, delta: number) => {
    setBoxItems((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta
            if (delta > 0 && newQty > item.product.stock) {
              return item
            }
            return newQty > 0 ? { ...item, quantity: newQty } : null
          }
          return item
        })
        .filter(Boolean) as BoxItem[]
    })
  }

  // Remove item from box
  const handleRemoveFromBox = (productId: string) => {
    setBoxItems((prev) => prev.filter((item) => item.product.id !== productId))
  }

  // Add custom BYOB box to cart
  const handleAddBoxToCart = async () => {
    if (!isMinimumReached || boxItems.length === 0) return

    try {
      setAddingToCart(true)
      const formattedBoxItems = boxItems.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
        mrp: item.product.mrp || item.product.price,
        lineTotal: item.product.price * item.quantity,
        category: item.product.category,
        image: item.product.image,
      }))

      await addToCart({
        isByob: true,
        quantity: 1,
        byobBox: {
          items: boxItems.map((b) => ({ productId: b.product.id, quantity: b.quantity })),
        },
        byobDetails: {
          minimumSubtotal: settings.minimumSubtotal,
          boxSubtotal,
          shippingFee: settings.shippingFee,
          total: boxTotal,
          items: formattedBoxItems,
        },
      })

      closeDrawer()
      setMobileDrawerOpen(false)
      navigate('/cart')
    } catch (err) {
      console.error('Failed to add BYOB box to cart:', err)
    } finally {
      setAddingToCart(false)
    }
  }

  const renderBoxSummary = () => (
    <div className="byob-box-card">
      <div className="byob-box-header">
        <div className="box-title-row">
          <span className="box-icon">🎁</span>
          <div>
            <h2>Your Custom Box</h2>
            <small>{totalQuantityInBox} items chosen</small>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="byob-progress-container">
        <div className="progress-labels">
          <span>Box Value: ₹{boxSubtotal.toLocaleString('en-IN')}</span>
          <span>Min: ₹{minRequired.toLocaleString('en-IN')}</span>
        </div>
        <div className="progress-track" role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100}>
          <div
            className={`progress-fill ${isMinimumReached ? 'complete' : ''}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="progress-status-msg">
          {isMinimumReached ? (
            <span className="status-success">
              <Sparkles size={14} /> ✨ Your box is ready!
            </span>
          ) : (
            <span className="status-pending">
              Add ₹{remaining.toLocaleString('en-IN')} more to unlock checkout
            </span>
          )}
        </div>
      </div>

      {/* Items inside Box */}
      <div className="byob-box-items-list">
        {boxItems.length === 0 ? (
          <div className="box-empty-hint">
            <p>Your box is empty right now.</p>
            <small>Pick your favorite Kawaii and Jewellery pieces on the left to start building!</small>
          </div>
        ) : (
          boxItems.map(({ product, quantity }) => (
            <div className="byob-box-item-row" key={product.id}>
              <img
                src={optimizeCloudinaryImage(product.image, 120)}
                alt={product.name}
                loading="lazy"
                decoding="async"
              />
              <div className="box-item-info">
                <h4>{product.name}</h4>
                <span className="box-item-price">
                  ₹{(product.price * quantity).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="box-item-controls">
                <button
                  type="button"
                  onClick={() => handleUpdateBoxQty(product.id, -1)}
                  aria-label="Decrease quantity"
                >
                  <Minus size={12} />
                </button>
                <span>{quantity}</span>
                <button
                  type="button"
                  disabled={quantity >= product.stock}
                  onClick={() => handleUpdateBoxQty(product.id, 1)}
                  aria-label="Increase quantity"
                  title={quantity >= product.stock ? 'Maximum available stock reached' : undefined}
                >
                  <Plus size={12} />
                </button>
                <button
                  type="button"
                  className="box-item-trash"
                  onClick={() => handleRemoveFromBox(product.id)}
                  aria-label="Remove item"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Order Math */}
      <div className="byob-box-totals">
        <div className="totals-row">
          <span>Box Subtotal</span>
          <strong>₹{boxSubtotal.toLocaleString('en-IN')}</strong>
        </div>
        <div className="totals-row">
          <span>Shipping</span>
          <span>
            {isMinimumReached ? `₹${settings.shippingFee.toLocaleString('en-IN')}` : '₹0'}
          </span>
        </div>
        {isMinimumReached && (
          <div className="totals-row total-highlight">
            <span>Total Amount</span>
            <strong>₹{boxTotal.toLocaleString('en-IN')}</strong>
          </div>
        )}
      </div>

      {/* Action Button */}
      <button
        type="button"
        className={`byob-checkout-btn ${isMinimumReached ? 'unlocked' : 'locked'}`}
        disabled={!isMinimumReached || addingToCart}
        onClick={handleAddBoxToCart}
      >
        {addingToCart ? (
          'Adding Box to Cart...'
        ) : isMinimumReached ? (
          <>
            Add Box to Cart <ShoppingBag size={17} />
          </>
        ) : (
          `Add ₹${remaining.toLocaleString('en-IN')} More to Unlock`
        )}
      </button>
    </div>
  )

  return (
    <main className="byob-page container">
      {/* Header */}
      <header className="byob-header">
        <span className="byob-eyebrow">
          <Gift size={15} /> CURATED WITH LOVE
        </span>
        <h1>BUILD YOUR OWN BOX</h1>
        <p className="byob-subheading">Your box. Your picks. Your way.</p>
        <div className="byob-rule-pills">
          <span className="rule-pill">✦ Handpick Kawaii & Jewellery</span>
          <span className="rule-pill">✦ Minimum Value: ₹{minRequired.toLocaleString('en-IN')}</span>
          <span className="rule-pill">✦ Fast Pan-India Delivery (₹{settings.shippingFee})</span>
        </div>
      </header>

      {/* Main Layout: Products Grid + Sticky Box Summary */}
      <div className="byob-layout">
        {/* Products Column */}
        <div className="byob-products-col">
          {/* Tabs */}
          <div className="byob-tabs" role="tablist">
            <button
              type="button"
              className={`byob-tab ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
              role="tab"
              aria-selected={activeTab === 'all'}
            >
              All Items ({categoryCounts.all})
            </button>
            <button
              type="button"
              className={`byob-tab ${activeTab === 'kawaii' ? 'active' : ''}`}
              onClick={() => setActiveTab('kawaii')}
              role="tab"
              aria-selected={activeTab === 'kawaii'}
            >
              🐰 Kawaii ({categoryCounts.kawaii})
            </button>
            <button
              type="button"
              className={`byob-tab ${activeTab === 'jewellery' ? 'active' : ''}`}
              onClick={() => setActiveTab('jewellery')}
              role="tab"
              aria-selected={activeTab === 'jewellery'}
            >
              ✧ Jewellery ({categoryCounts.jewellery})
            </button>
          </div>

          {/* Product Cards */}
          {loading ? (
            <div className="byob-loading">Loading eligible box treasures...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="byob-empty-category">No items available in this category.</div>
          ) : (
            <div className="byob-grid">
              {filteredProducts.map((product) => {
                const inBox = boxItems.find((item) => item.product.id === product.id)
                const isOutOfStock = product.stock <= 0
                const isMaxInBox = inBox ? inBox.quantity >= product.stock : false
                const hasDiscount = product.mrp && product.mrp > product.price
                const discountPercent = hasDiscount
                  ? Math.round(((product.mrp! - product.price) / product.mrp!) * 100)
                  : 0

                return (
                  <article className="byob-card" key={product.id}>
                    <div className="byob-card-image-wrap">
                      <img
                        src={optimizeCloudinaryImage(product.image, 500)}
                        alt={product.name}
                        loading="lazy"
                        decoding="async"
                      />
                      {hasDiscount && (
                        <span className="byob-discount-badge">{discountPercent}% OFF</span>
                      )}
                      {inBox && (
                        <span className="byob-count-tag">
                          {inBox.quantity} in box
                        </span>
                      )}
                    </div>

                    <div className="byob-card-body">
                      <span className="byob-card-cat">{product.category}</span>
                      <h3 className="byob-card-title">{product.name}</h3>

                      <div className="byob-card-pricing">
                        <strong className="byob-selling-price">
                          ₹{product.price.toLocaleString('en-IN')}
                        </strong>
                        {hasDiscount && (
                          <span className="byob-mrp-price">
                            ₹{product.mrp!.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        className={`byob-add-btn ${inBox ? 'is-in-box' : ''} ${isOutOfStock || isMaxInBox ? 'disabled' : ''}`}
                        onClick={() => handleAddToBox(product)}
                        disabled={isOutOfStock || isMaxInBox}
                      >
                        <Plus size={14} />
                        <span>
                          {isOutOfStock
                            ? 'Out of Stock'
                            : isMaxInBox
                            ? 'Max in Box'
                            : inBox
                            ? 'Add Another'
                            : 'Add to Box'}
                        </span>
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </div>

        {/* Box Summary Sidebar (Sticky Desktop) */}
        <aside className={`byob-box-sidebar ${boxReact ? 'box-bounce' : ''}`}>
          {renderBoxSummary()}
        </aside>
      </div>

      {/* Mobile Sticky Bottom Summary Bar */}
      <div className="byob-mobile-bar" role="region" aria-label="Mobile box summary">
        <div className="byob-mobile-bar-info">
          <span className="byob-mobile-bar-title">YOUR BOX</span>
          <span className="byob-mobile-bar-meta">
            {totalQuantityInBox} {totalQuantityInBox === 1 ? 'ITEM' : 'ITEMS'} · ₹{boxSubtotal.toLocaleString('en-IN')}
          </span>
          <span className={`byob-mobile-bar-subtext ${isMinimumReached ? 'unlocked' : ''}`}>
            {isMinimumReached
              ? '✨ Ready to checkout'
              : `Add ₹${remaining.toLocaleString('en-IN')} to unlock`}
          </span>
        </div>
        <button
          type="button"
          className={`byob-mobile-bar-btn ${isMinimumReached ? 'unlocked' : ''}`}
          onClick={() => setMobileDrawerOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={mobileDrawerOpen}
        >
          {isMinimumReached ? 'CHECKOUT BOX' : 'VIEW BOX'}
        </button>
      </div>

      {/* Mobile Bottom Sheet Drawer */}
      {mobileDrawerOpen && (
        <div
          className="byob-mobile-drawer-overlay"
          onClick={() => setMobileDrawerOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Your custom box details"
        >
          <div className="byob-mobile-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="byob-mobile-drawer-header">
              <span className="drawer-drag-pill" />
              <button
                type="button"
                className="byob-mobile-drawer-close"
                onClick={() => setMobileDrawerOpen(false)}
                aria-label="Close box"
              >
                <X size={20} />
              </button>
            </div>
            {renderBoxSummary()}
          </div>
        </div>
      )}
    </main>
  )
}

export default Byob
