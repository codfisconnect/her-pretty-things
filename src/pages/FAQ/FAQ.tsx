import { Link } from 'react-router-dom'

function FAQ() {
  return (
    <main className="container">
      <section className="jewellery-page">
        <div className="jewellery-intro">
          <p className="eyebrow">Customer Care</p>

          <h1>FAQ</h1>

          <h2>How can I place an order?</h2>
          <p>
            Browse our products, choose your favourite item, and add it to
            your cart.
          </p>

          <h2>How can I contact you?</h2>
          <p>
            Email us at{' '}
            <a href="mailto:shop.herprettythings@gmail.com">
              shop.herprettythings@gmail.com
            </a>
          </p>

          <h2>Do you provide shipping?</h2>
          <p>
            Yes, we provide delivery across India.
          </p>

          <Link to="/" className="product-back-link">
            ← Back to Home
          </Link>
        </div>
      </section>
    </main>
  )
}

export default FAQ