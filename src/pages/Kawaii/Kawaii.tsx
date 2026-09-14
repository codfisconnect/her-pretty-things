import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getProducts } from '../../services/productService'
import type { Product } from '../../types/product'

function Kawaii() {
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    getProducts('kawaii')
      .then(setProducts)
      .catch((error) => {
        console.error('Could not load Kawaii products:', error)
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
              <p className="jewellery-product-category">
                Kawaii
              </p>

              <h2>
                <Link to={`/product/${product.id}`}>
                  {product.name}
                </Link>
              </h2>

              <p className="jewellery-product-price">
                ₹{product.price}
              </p>

              <div className="jewellery-product-badges">
                <span>Kawaii</span>
              </div>

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