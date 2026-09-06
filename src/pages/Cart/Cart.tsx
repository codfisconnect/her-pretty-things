import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCart, type CartResponse } from '../../services/cartService'

function Cart() {
  const [cart, setCart] = useState<CartResponse | null>(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const cartId = localStorage.getItem('hpt_cart_id')
    if (!cartId) return
    getCart(cartId).then(setCart).catch((error: unknown) => setMessage(error instanceof Error ? error.message : 'Could not load your cart.'))
  }, [])

  if (!cart) return <section className="placeholder-page container"><p className="eyebrow">Your pretty things</p><h1>Your cart is waiting</h1><p>{message || 'Once you find something lovely, it will appear here.'}</p><Link className="button button-dark" to="/scoops">Build a scoop</Link></section>

  return <section className="checkout-page container"><p className="eyebrow">Your pretty things</p><h1>Your cart</h1><div className="checkout-layout"><div className="cart-items">{cart.items.map((item) => <article className="cart-line" key={item.id}><div><h2>{item.isCustomizedScoop ? `${item.numberOfScoops}-scoop surprise` : item.product?.name}</h2><p>{item.isCustomizedScoop ? 'Customized scoop' : `Quantity: ${item.quantity}`}</p></div><strong>₹{item.total.toLocaleString('en-IN')}</strong></article>)}</div><aside className="checkout-summary"><p>Subtotal <strong>₹{cart.subtotal.toLocaleString('en-IN')}</strong></p><p>Shipping <strong>₹{cart.shipping.toLocaleString('en-IN')}</strong></p><div><span>Total</span><strong>₹{cart.total.toLocaleString('en-IN')}</strong></div><Link className="button button-dark" to="/shipping">Proceed to Shipping</Link></aside></div></section>
}

export default Cart
