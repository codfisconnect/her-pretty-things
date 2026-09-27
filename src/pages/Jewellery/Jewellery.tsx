import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProducts } from '../../services/productService'
import ProductCard from '../../components/ProductCard/ProductCard'
import type { Product } from '../../types/product'
import './Jewellery.css'

function Jewellery() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    getProducts('jewellery')
      .then(setProducts)
      .catch((err) => {
        console.error(err)
        setError('Could not load jewellery products.')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  return (
    <section className="jewellery-page container">
      <button
        type="button"
        className="category-back-button"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>

      <div className="jewellery-intro">
        <span className="eyebrow">PRETTY PIECES FOR EVERY DAY</span>
        <h1>Jewellery Collection</h1>
        <p style={{ color: '#716269', fontSize: '0.95rem', margin: '0.4rem 0 0' }}>
          Delicate necklaces, sparkling earrings, and sweet charms to brighten your little moments.
        </p>
      </div>

      <div className="jewellery-product-grid">
        {loading && <p>Loading lovely pieces...</p>}

        {!loading && error && <p>{error}</p>}

        {!loading && !error && products.length === 0 && (
          <p>No jewellery products available.</p>
        )}

        {!loading &&
          !error &&
          products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
      </div>
    </section>
  )
}

export default Jewellery