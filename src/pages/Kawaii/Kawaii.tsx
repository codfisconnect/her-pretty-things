import { useEffect, useState } from 'react'
import { getProducts } from '../../services/productService'
import ProductGrid from '../../components/ProductGrid/ProductGrid'
import type { Product } from '../../types/product'

function Kawaii() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getProducts('kawaii')
      .then((data) => {
        setProducts(data)
        setError('')
      })
      .catch((error) => {
        console.error('Could not load Kawaii products:', error)
        setError('Could not load Kawaii products.')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  return (
    <section className="jewellery-page container">
      <div className="jewellery-intro">
        <p className="eyebrow">Collection 03</p>

        <h1>Kawaii</h1>

        <p>
          Cute little pieces, playful details, and charming finds
          designed to add a little more joy to your everyday style.
        </p>
      </div>

      {loading && (
        <p>Loading Kawaii products...</p>
      )}

      {!loading && error && (
        <p>{error}</p>
      )}

      {!loading && !error && products.length === 0 && (
        <p>No Kawaii products found.</p>
      )}

      {!loading && !error && products.length > 0 && (
        <ProductGrid products={products} />
      )}
    </section>
  )
}

export default Kawaii