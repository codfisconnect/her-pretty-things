import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getProducts } from '../../services/productService'
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
        <h1>Jewellery</h1>
      </div>

      <div className="jewellery-product-grid">
        {loading && <p>Loading jewellery products...</p>}

        {!loading && error && <p>{error}</p>}

        {!loading && !error && products.length === 0 && (
          <p>No jewellery products available.</p>
        )}

        {!loading &&
          !error &&
          products.map((product) => (
            <article className="jewellery-product" key={product.id}>
              <Link
                to={`/product/${product.id}`}
                className="jewellery-product-image"
              >
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                  />
                ) : (
                  <span>No image</span>
                )}
              </Link>

              <div className="jewellery-product-info">
                

                <h2>
                  <Link to={`/product/${product.id}`}>
                    {product.name}
                  </Link>
                </h2>

                <p className="jewellery-product-price">
                  ₹{product.price}
                </p>

                <Link
                  to={`/product/${product.id}`}
                  className="jewellery-view-button"
                >
                  MAKE IT YOURS
                </Link>
              </div>
            </article>
          ))}
      </div>
    </section>
  )
}

export default Jewellery