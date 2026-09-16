import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { createAdminProduct } from '../../../services/adminService'

function AddProduct() {
  const [name, setName] = useState('')
  const [category, setCategory] = useState<'scoops' | 'jewellery' | 'kawaii'>('kawaii')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [stock, setStock] = useState('')
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      await createAdminProduct(
        {
          name,
          category,
          price: Number(price),
          description,
          stock: Number(stock),
        },
        imageFiles,
      )

      setMessage('Product created successfully.')

      setName('')
      setPrice('')
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
          <p>Create a new product for your store.</p>
        </div>
      </div>

      <form className="admin-product-form" onSubmit={handleSubmit}>
        <label>
          Product Name
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Enter product name"
            required
          />
        </label>

        <label>
          Category
          <select
            value={category}
            onChange={(event) =>
              setCategory(
                event.target.value as 'scoops' | 'jewellery' | 'kawaii',
              )
            }
          >
            <option value="kawaii">Kawaii</option>
            <option value="jewellery">Jewellery</option>
            <option value="scoops">Scoops</option>
          </select>
        </label>

        <label>
          Price (₹)
          <input
            type="number"
            min="0"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            placeholder="699"
            required
          />
        </label>

        <label>
          Stock
          <input
            type="number"
            min="0"
            value={stock}
            onChange={(event) => setStock(event.target.value)}
            placeholder="10"
            required
          />
        </label>

        <label>
          Product Image
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
          <p>
            {imageFiles.length} image{imageFiles.length > 1 ? 's' : ''} selected
          </p>
        )}

        <label>
          Description
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Enter product description"
            rows={6}
            required
          />
        </label>

        <button type="submit" disabled={saving}>
          {saving ? 'Creating Product...' : 'Create Product'}
        </button>

        {message && <p>{message}</p>}
      </form>
    </div>
  )
}

export default AddProduct