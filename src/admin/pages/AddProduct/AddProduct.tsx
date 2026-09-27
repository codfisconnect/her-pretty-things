import { useState, useMemo } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { createAdminProduct } from '../../../services/adminService'

function AddProduct() {
  const [name, setName] = useState('')
  const [category, setCategory] = useState<'scoops' | 'jewellery' | 'kawaii'>('kawaii')
  const [mrp, setMrp] = useState('')
  const [price, setPrice] = useState('')
  const [sku, setSku] = useState('')
  const [byobEligible, setByobEligible] = useState(true)
  const [description, setDescription] = useState('')
  const [stock, setStock] = useState('')
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  // Auto-calculated discount
  const discountInfo = useMemo(() => {
    const numMrp = parseFloat(mrp)
    const numPrice = parseFloat(price)
    if (!isNaN(numMrp) && !isNaN(numPrice) && numMrp > numPrice && numPrice >= 0) {
      const amount = Math.round((numMrp - numPrice) * 100) / 100
      const percent = Math.round(((numMrp - numPrice) / numMrp) * 100)
      return { amount, percent }
    }
    return null
  }, [mrp, price])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      const numMrp = mrp ? Number(mrp) : undefined
      const numPrice = Number(price)

      if (numMrp !== undefined && numPrice > numMrp) {
        throw new Error('Selling price cannot exceed MRP.')
      }

      await createAdminProduct(
        {
          name,
          category,
          price: numPrice,
          mrp: numMrp,
          sku: sku.trim() || undefined,
          byobEligible: category !== 'scoops' ? byobEligible : false,
          description,
          stock: Number(stock),
        },
        imageFiles,
      )

      setMessage('Product created successfully.')

      setName('')
      setMrp('')
      setPrice('')
      setSku('')
      setDescription('')
      setStock('')
      setImageFiles([])

      const fileInput = document.getElementById(
        'product-image',
      ) as HTMLInputElement | null

      if (fileInput) {
        fileInput.value = ''
      }
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Could not create product.',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Add Product</h1>
          <p>Create a new product with MRP, selling price, and BYOB settings.</p>
        </div>
      </div>

      <form className="admin-product-form" onSubmit={handleSubmit}>
        <label>
          Product Name *
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Bow Pearl Pendant"
            required
          />
        </label>

        <div>
          <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#4b3f46', marginBottom: '0.4rem' }}>
            Category * (Current: <strong style={{ color: '#db2777', textTransform: 'capitalize' }}>{category}</strong>)
          </span>
          <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            {[
              { id: 'kawaii', label: '🐰 Kawaii' },
              { id: 'jewellery', label: '✧ Jewellery' },
              { id: 'scoops', label: '🍨 Scoops' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  const val = cat.id as 'scoops' | 'jewellery' | 'kawaii'
                  setCategory(val)
                  if (val === 'scoops') setByobEligible(false)
                }}
                style={{
                  padding: '0.55rem 1.1rem',
                  borderRadius: '999px',
                  border: category === cat.id ? '2px solid #db2777' : '1px solid #e2d1d9',
                  background: category === cat.id ? '#fdf2f8' : '#ffffff',
                  color: category === cat.id ? '#db2777' : '#574850',
                  fontWeight: category === cat.id ? 700 : 500,
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  transition: 'all 0.15s ease',
                }}
              >
                {cat.label}
                {category === cat.id && <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>✓</span>}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <label>
            MRP / Original Price (₹)
            <input
              type="number"
              min="0"
              step="1"
              value={mrp}
              onChange={(event) => setMrp(event.target.value)}
              placeholder="e.g. 999"
            />
          </label>

          <label>
            Selling Price (₹) *
            <input
              type="number"
              min="0"
              step="1"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              placeholder="e.g. 699"
              required
            />
          </label>
        </div>

        {discountInfo && (
          <div style={{
            background: '#fdf2f8',
            border: '1px solid #fbcfe8',
            padding: '0.65rem 1rem',
            borderRadius: 8,
            fontSize: '0.85rem',
            color: '#be185d',
            fontWeight: 600
          }}>
            ✦ Auto-calculated Discount: ₹{discountInfo.amount} OFF ({discountInfo.percent}% OFF)
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <label>
            Stock Quantity *
            <input
              type="number"
              min="0"
              value={stock}
              onChange={(event) => setStock(event.target.value)}
              placeholder="25"
              required
            />
          </label>

          <label>
            SKU Code (optional)
            <input
              type="text"
              value={sku}
              onChange={(event) => setSku(event.target.value)}
              placeholder="HPT-JEW-001"
            />
          </label>
        </div>

        {category !== 'scoops' && (
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', margin: '0.5rem 0' }}>
            <input
              type="checkbox"
              checked={byobEligible}
              onChange={(e) => setByobEligible(e.target.checked)}
              style={{ width: 'auto' }}
            />
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
              Eligible for Build Your Own Box (BYOB)
            </span>
          </label>
        )}

        <label>
          Product Images (Upload)
          <input
            id="product-image"
            type="file"
            accept="image/*"
            multiple
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setImageFiles(Array.from(event.target.files ?? []))
            }
          />
        </label>

        {imageFiles.length > 0 && (
          <p style={{ color: '#047857', fontSize: '0.85rem', margin: 0 }}>
            {imageFiles.length} image{imageFiles.length > 1 ? 's' : ''} selected.
          </p>
        )}

        <label>
          Description *
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Enter product description, care details, and materials..."
            rows={5}
            required
          />
        </label>

        <button type="submit" disabled={saving}>
          {saving ? 'Creating Product...' : 'Create Product'}
        </button>

        {message && <p style={{ fontWeight: 600, color: message.includes('success') ? '#047857' : '#e11d48' }}>{message}</p>}
      </form>
    </div>
  )
}

export default AddProduct