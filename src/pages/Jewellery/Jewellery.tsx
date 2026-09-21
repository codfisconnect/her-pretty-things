import { useEffect, useState } from 'react'
import { getProducts } from '../../services/productService'
import ProductGrid from '../../components/ProductGrid/ProductGrid'
import type { Product } from '../../types/product'

function Jewellery() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getProducts('jewellery')
      .then((data) => {
        setProducts(data)
        setError('')
      })
      .catch((error) => {
        console.error('Could not load Jewellery products:', error)
        setError('Could not load Jewellery products.')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  return (
    <section className="jewellery-page container">
      <div className="jewellery-intro">
        <p className="eyebrow">Collection 02</p>

        <h1>Jewellery</h1>

        <p>
          Delicate details, everyday sparkle, and pretty little pieces
          designed to make every outfit feel a little more special.
        </p>
      </div>

      {loading && <p>Loading Jewellery products...</p>}

      {!loading && error && <p>{error}</p>}

      {!loading && !error && products.length === 0 && (
        <p>No Jewellery products found.</p>
      )}

      {!loading && !error && products.length > 0 && (
        <ProductGrid products={products} />
      )}
    </section>
  )
}

export default Jewellery