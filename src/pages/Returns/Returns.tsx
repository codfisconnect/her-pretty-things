import { Link } from 'react-router-dom'

function Returns() {
  return (
    <main className="container">
      <section className="jewellery-page">
        <div className="jewellery-intro">
          <p className="eyebrow">Customer Care</p>

          <h1>Returns</h1>

          <p>
            If you have any issue with your order, please contact us
            and our team will help you.
          </p>

          <p>
            For return-related questions, email us at{' '}
            <a href="mailto:shop.herprettythings@gmail.com">
              shop.herprettythings@gmail.com
            </a>
          </p>

          <Link to="/" className="product-back-link">
            ← Back to Home
          </Link>
        </div>
      </section>
    </main>
  )
}

export default Returns