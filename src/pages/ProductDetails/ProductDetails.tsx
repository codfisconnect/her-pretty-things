import { Link, useParams } from 'react-router-dom'

function ProductDetails() {
  const { id } = useParams()
  const productName = id?.split('-').map((word) => word[0].toUpperCase() + word.slice(1)).join(' ')

  return <section className="placeholder-page container"><p className="eyebrow">Product details</p><h1>{productName ?? 'Pretty product'}</h1><p>This product page is ready for its details, gallery, and shopping experience.</p><Link className="button button-dark" to="/">Back to home</Link></section>
}

export default ProductDetails
