import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getCart,
  removeCartItem,
  updateCartItem,
  type CartResponse,
} from "../../services/cartService";

function Cart() {
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const cartId = localStorage.getItem("hpt_cart_id");

    if (!cartId) return;

    getCart(cartId)
      .then(setCart)
      .catch((error: unknown) => {
        setMessage(
          error instanceof Error ? error.message : "Could not load your cart.",
        );
      });
  }, []);

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    try {
      const updatedCart = await updateCartItem(itemId, newQuantity);
      setCart(updatedCart);
    } catch (error: unknown) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not update the quantity.",
      );
    }
  };

  const handleRemove = async (itemId: string) => {
    try {
      const updatedCart = await removeCartItem(itemId);

      if (updatedCart.items.length === 0) {
        localStorage.removeItem("hpt_cart_id");
        window.location.href = "/scoops";
        return;
      }

      setCart(updatedCart);
    } catch (error: unknown) {
      setMessage(
        error instanceof Error ? error.message : "Could not remove the item.",
      );
    }
  };

  if (!cart) {
    return (
      <section className="placeholder-page container">
        <p className="eyebrow">Your pretty things</p>

        <h1>Your cart is waiting</h1>

        <p>
          {message || "Once you find something lovely, it will appear here."}
        </p>

        <Link className="button button-dark" to="/scoops">
          Build a scoop
        </Link>
      </section>
    );
  }

  return (
    <section className="checkout-page container">
      <p className="eyebrow">Your pretty things</p>

      <h1>Your cart</h1>

      {message && <p>{message}</p>}

      <div className="checkout-layout">
        <div className="cart-items">
          {cart.items.map((item) => (
            <article className="cart-line" key={item.id}>
              <div>
                <h2>
                  {item.isCustomizedScoop
                    ? `${item.numberOfScoops}-scoop surprise`
                    : item.product?.name}
                </h2>

                <p>
                  {item.isCustomizedScoop
                    ? `Customized scoop · Quantity: ${item.quantity}`
                    : `Quantity: ${item.quantity}`}
                </p>

                <div className="cart-quantity-control">
                  <button
                    type="button"
                    disabled={item.quantity === 1}
                    onClick={() =>
                      handleQuantityChange(
                        item.id,
                        Math.max(1, item.quantity - 1),
                      )
                    }
                  >
                    −
                  </button>

                  <span>{item.quantity}</span>

                  <button
                    type="button"
                    onClick={() =>
                      handleQuantityChange(item.id, item.quantity + 1)
                    }
                  >
                    +
                  </button>

                  <button
                    type="button"
                    className="cart-remove-button"
                    onClick={() => handleRemove(item.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="cart-line-price">
                <p>
                  ₹{item.unitPrice.toLocaleString("en-IN")} × {item.quantity}
                </p>

                <strong>₹{item.total.toLocaleString("en-IN")}</strong>
              </div>
            </article>
          ))}
        </div>

        <aside className="checkout-summary">
          <p>
            Subtotal <strong>₹{cart.subtotal.toLocaleString("en-IN")}</strong>
          </p>

          <p>
            Shipping <strong>₹{cart.shipping.toLocaleString("en-IN")}</strong>
          </p>

          <div>
            <span>Total</span>

            <strong>₹{cart.total.toLocaleString("en-IN")}</strong>
          </div>

          <Link className="button button-dark" to="/shipping">
            Proceed to Shipping
          </Link>
        </aside>
      </div>
    </section>
  );
}

export default Cart;
