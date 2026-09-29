import { useEffect, useState, useMemo } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'
import {
  deleteAdminProduct,
  deleteAdminProductImage,
  getAdminProduct,
  updateAdminProduct,
  uploadAdminProductImages,
} from '../../../services/adminService'
import './EditProduct.css'

type Category = 'scoops' | 'jewellery' | 'kawaii'

function EditProduct() {
  const { productId } = useParams()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [category, setCategory] = useState<Category>('kawaii')
  const [mrp, setMrp] = useState('')
  const [price, setPrice] = useState('')
  const [sku, setSku] = useState('')
  const [byobEligible, setByobEligible] = useState(true)
  const [description, setDescription] = useState('')
  const [stock, setStock] = useState('')

  const [currentImages, setCurrentImages] = useState<string[]>([])
  const [currentImageRecords, setCurrentImageRecords] = useState<
    {
      id: string
      url: string
      altText: string | null
      sortOrder: number
    }[]
  >([])
  const [imageFiles, setImageFiles] = useState<File[]>([])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [message, setMessage] = useState('')

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

  useEffect(() => {
    async function loadProduct() {
      if (!productId) return

      try {
        setLoading(true)
        const product = await getAdminProduct(productId)

        setName(product.name ?? '')
        setCategory((product.category as Category) ?? 'kawaii')
        setMrp(product.mrp !== undefined && product.mrp !== null ? String(product.mrp) : '')
        setPrice(String(product.price ?? ''))
        setSku((product as any).sku ?? '')
        setByobEligible((product as any).byobEligible ?? true)
        setDescription(product.description ?? '')
        setStock(String(product.stock ?? ''))

        const rawImages = (product as any).images || []
        const isObjArray = rawImages.length > 0 && typeof rawImages[0] === 'object'

        if (isObjArray) {
          setCurrentImageRecords(rawImages)
          setCurrentImages(rawImages.map((img: any) => img.url))
        } else {
          setCurrentImages(rawImages)
          setCurrentImageRecords(rawImages.map((url: string, idx: number) => ({
            id: `img-${idx}`,
            url,
            altText: null,
            sortOrder: idx,
          })))
        }
      } catch (error) {
        console.error('Could not load product:', error)
        setMessage('Could not load product.')
      } finally {
        setLoading(false)
      }
    }

    loadProduct()
  }, [productId])

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    setImageFiles(Array.from(event.target.files ?? []))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!productId) return

    try {
      setSaving(true)
      setMessage('')

      const numMrp = mrp ? Number(mrp) : undefined
      const numPrice = Number(price)

      if (numMrp !== undefined && numPrice > numMrp) {
        throw new Error('Selling price cannot exceed MRP.')
      }

      let images = currentImages

      if (imageFiles.length > 0) {
        const uploadedImages = await uploadAdminProductImages(imageFiles)
        images = [...currentImages, ...uploadedImages]
      }

      await updateAdminProduct(productId, {
        name,
        category,
        mrp: numMrp,
        price: numPrice,
        sku: sku.trim() || undefined,
        byobEligible: category !== 'scoops' ? byobEligible : false,
        description,
        stock: Number(stock),
        images,
      })

      setMessage('Product updated successfully.')

      setTimeout(() => {
        navigate(`/admin/products/${productId}`)
      }, 700)
    } catch (error) {
      console.error('Could not update product:', error)
      setMessage(
        error instanceof Error ? error.message : 'Could not update product.',
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!productId) return

    const confirmed = window.confirm(
      `Are you sure you want to delete "${name}"?`,
    )

    if (!confirmed) return

    try {
      setDeleting(true)
      setMessage('')

      await deleteAdminProduct(productId)
      navigate('/admin/products')
    } catch (error) {
      console.error('Could not delete product:', error)
      setMessage(
        error instanceof Error ? error.message : 'Could not delete product.',
      )
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="admin-page">
        <div className="products-loading">Loading product...</div>
      </div>
    )
  }

  return (
    <div className="admin-page edit-product-page">
      <div className="edit-product-header">
        <Link to={`/admin/products/${productId}`} className="back-link">
          <ArrowLeft size={18} />
          <span>Back to Product</span>
        </Link>
        <h1>Edit Product</h1>
      </div>

      <form className="edit-product-form" onSubmit={handleSubmit}>
        <div className="edit-form-group">
          <label>
            Product Name *
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </label>
        </div>

        <div className="edit-form-group">
          <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>Category *</label>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {[
              { id: 'kawaii', label: 'Kawaii' },
              { id: 'jewellery', label: 'Jewellery' },
              { id: 'scoops', label: 'Scoops' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setCategory(cat.id as Category)
                  if (cat.id === 'scoops') setByobEligible(false)
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

        <div className="edit-form-row">
          <label>
            MRP / Original Price (₹)
            <input
              type="number"
              min="0"
              value={mrp}
              onChange={(event) => setMrp(event.target.value)}
              placeholder="999"
            />
          </label>

          <label>
            Selling Price (₹) *
            <input
              type="number"
              min="0"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              required
            />
          </label>

          <label>
            Stock *
            <input
              type="number"
              min="0"
              value={stock}
              onChange={(event) => setStock(event.target.value)}
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
          <label>
            SKU Code
            <input
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="e.g. HPT-KAW-042"
            />
          </label>

          {category !== 'scoops' && (
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '1.8rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={byobEligible}
                onChange={(e) => setByobEligible(e.target.checked)}
                style={{ width: 'auto' }}
              />
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                Eligible for BYOB Box
              </span>
            </label>
          )}
        </div>

        <div className="edit-current-images">
          <div className="edit-field-title">Current Product Images</div>

          {currentImageRecords.length > 0 ? (
            <div className="edit-image-preview-grid">
              {currentImageRecords.map((image, index) => (
                <div className="edit-image-preview" key={image.id || index}>
                  <img
                    src={image.url}
                    alt={image.altText || `${name} ${index + 1}`}
                  />

                  {productId && !image.id.startsWith('img-') && (
                    <button
                      type="button"
                      className="edit-image-delete-button"
                      onClick={async () => {
                        const confirmed = window.confirm(
                          'Are you sure you want to delete this image?',
                        )

                        if (!confirmed) return

                        try {
                          setMessage('')

                          await deleteAdminProductImage(productId, image.id)

                          setCurrentImageRecords((previousImages) =>
                            previousImages.filter(
                              (currentImage) => currentImage.id !== image.id,
                            ),
                          )

                          setCurrentImages((previousImages) =>
                            previousImages.filter(
                              (imageUrl) => imageUrl !== image.url,
                            ),
                          )

                          setMessage('Image deleted successfully.')
                        } catch (error) {
                          console.error('Could not delete product image:', error)

                          setMessage(
                            error instanceof Error
                              ? error.message
                              : 'Could not delete image.',
                          )
                        }
                      }}
                      disabled={saving || deleting}
                    >
                      <Trash2 size={15} />
                      Delete
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="edit-no-images">No current images for this product.</p>
          )}
        </div>

        <label className="edit-upload-box">
          <span className="edit-upload-title">Add More Images</span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
          />
          <small>Select new images to add to the existing images.</small>
        </label>

        {imageFiles.length > 0 && (
          <div className="edit-selected-files">
            Selected new files: {imageFiles.map((file) => file.name).join(', ')}
          </div>
        )}

        <label>
          Description *
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={5}
            required
          />
        </label>

        <div className="edit-product-actions">
          <button
            type="submit"
            className="save-button"
            disabled={saving || deleting}
          >
            <Save size={17} />
            {saving ? 'Saving Changes...' : 'Save Changes'}
          </button>

          <button
            type="button"
            className="delete-button"
            onClick={handleDelete}
            disabled={saving || deleting}
          >
            <Trash2 size={17} />
            {deleting ? 'Deleting...' : 'Delete Product'}
          </button>
        </div>

        {message && (
          <p className="edit-product-message" style={{ color: message.includes('success') ? '#047857' : '#e11d48' }}>
            {message}
          </p>
        )}
      </form>
    </div>
  )
}

export default EditProduct
