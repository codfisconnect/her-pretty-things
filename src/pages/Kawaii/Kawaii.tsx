import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProducts } from '../../services/productService'
import ProductCard from '../../components/ProductCard/ProductCard'
import type { Product } from '../../types/product'
import './Kawaii.css'

function Kawaii() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    getProducts('kawaii')
      .then(setProducts)
      .catch((error) => {
        console.error('Could not load Kawaii products:', error)
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
        <span className="eyebrow">CUTE FINDS & SWEET STATIONERY</span>
        <h1>Kawaii Collection</h1>
        <p style={{ color: '#716269', fontSize: '0.95rem', margin: '0.4rem 0 0' }}>
          Adorable plushies, pastel pens, aesthetic desk buddies, and accessories to bring a smile.
        </p>
      </div>

      <div className="jewellery-product-grid">
        {loading && <p>Loading kawaii treasures...</p>}

        {!loading && products.length === 0 && (
          <p>No kawaii products available.</p>
        )}

        {!loading &&
          products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
      </div>
    </section>
  )
}

export default Kawaii