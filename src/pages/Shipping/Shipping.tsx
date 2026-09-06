import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createOrder, type ShippingDetails } from '../../services/orderService'

const emptyShipping: ShippingDetails = { fullName: '', phoneNumber: '', email: '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '' }

function Shipping() {
  const [shipping, setShipping] = useState<ShippingDetails>(emptyShipping)
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => setShipping({ ...shipping, [event.target.name]: event.target.value })
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const cartId = localStorage.getItem('hpt_cart_id')
    if (!cartId) { setMessage('Your cart is empty. Please build a scoop first.'); return }
    try {
      const order = await createOrder(cartId, shipping)
      localStorage.setItem('hpt_order_id', order.id)
      navigate(`/payment/${order.id}`)
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not create your order.') }
  }

  return <section className="checkout-page container"><p className="eyebrow">Almost yours</p><h1>Shipping details</h1><p className="checkout-intro">Tell us where to send your pretty things.</p><form className="shipping-form" onSubmit={handleSubmit}><div className="shipping-grid">{[['fullName','Full Name'],['phoneNumber','Phone Number'],['email','Email'],['addressLine1','Address Line 1'],['addressLine2','Address Line 2'],['city','City'],['state','State'],['pincode','Pincode']].map(([name, label]) => <label key={name}><span>{label}{name !== 'addressLine2' && ' *'}</span><input name={name} value={shipping[name as keyof ShippingDetails] ?? ''} onChange={handleChange} required={name !== 'addressLine2'} /></label>)}</div>{message && <p className="scoop-error" role="alert">{message}</p>}<div className="checkout-actions"><Link className="text-link" to="/cart">Back to cart</Link><button className="button button-dark" type="submit">Create Order</button></div></form></section>
}

export default Shipping