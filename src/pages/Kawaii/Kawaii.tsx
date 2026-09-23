import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getProducts } from '../../services/productService'
import type { Product } from '../../types/product'
import './Kawaii.css'

function Kawaii() {
  const [products, setProducts] = useState<Product[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    getProducts('kawaii')
      .then(setProducts)
      .catch((error) => {
        console.error('Could not load Kawaii products:', error)
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
        <h1>Kawaii</h1>
      </div>

      <div className="jewellery-product-grid">
        {products.map((product) => (
          <article
            className="jewellery-product"
            key={product.id}
          >
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
                <div>No image available</div>
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

export default Kawaii