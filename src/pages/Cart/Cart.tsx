import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Trash2, Gift, Sparkles } from "lucide-react";
import { useCart } from "../../context/CartContext";

function Cart() {
  const { cart, updateQuantity, removeFromCart, itemCount, subtotal, shipping, total, loading } = useCart();
  const navigate = useNavigate();

  if (loading && !cart) {
    return (
      <main className="checkout-page container">
        <div style={{ textAlign: "center", padding: "4rem 0" }}>
          <p>Loading your pretty cart...</p>
        </div>
      </main>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <section className="placeholder-page container">
        <p className="eyebrow">Your pretty things</p>
        <h1>Your cart is waiting</h1>
        <p>Once you find something lovely, it will appear here.</p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", marginTop: "1.5rem" }}>
          <Link className="button button-dark" to="/scoops">
            Build a Scoop
          </Link>
          <Link className="button button-outline" to="/byob">
            Build Your Own Box
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="checkout-page container">
      <p className="eyebrow">Little joys, gathered with love</p>
      <h1>Your Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})</h1>

      <div className="checkout-layout">
        {/* Items List */}
        <div className="cart-items">
          {cart.items.map((item) => {
            const isScoop = item.isCustomizedScoop;
            const isByob = item.isByob;
            const byobDetails = item.byobDetails as any;

            return (
              <article className="cart-line" key={item.id}>
                <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                  <div style={{
                    width: 76,
                    height: 76,
                    borderRadius: 12,
                    background: "#fdf2f6",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0
                  }}>
                    {isScoop ? (
                      <span style={{ fontSize: "2rem" }}>🍨</span>
                    ) : isByob ? (
                      <span style={{ fontSize: "2rem" }}>🎁</span>
                    ) : (
                      <img
                        src={item.product?.image || "/placeholder.png"}
                        alt={item.product?.name || "Product"}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    )}
                  </div>

                  <div style={{ flex: 1 }}>
                    <h2 style={{ fontSize: "1.05rem", margin: "0 0 0.3rem" }}>
                      {isScoop
                        ? `${item.numberOfScoops}-Scoop Surprise`
                        : isByob
                          ? "Custom Gift Box (BYOB)"
                          : item.product?.name}
                    </h2>

                    <p style={{ margin: "0 0 0.5rem", fontSize: "0.85rem", color: "#8c7b83" }}>
                      {isScoop
                        ? `Customized Scoop · ${item.colourTheme ? `Theme: ${item.colourTheme}` : 'Mystery choice'}`
                        : isByob && byobDetails?.items
                          ? `${byobDetails.items.length} custom handpicked items`
                          : `Category: ${item.product?.category || "Jewellery"}`}
                    </p>

                    {isByob && byobDetails?.items && (
                      <div style={{ marginBottom: "0.6rem", fontSize: "0.82rem", color: "#db2777" }}>
                        <Gift size={13} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />
                        {byobDetails.items.map((b: any) => `${b.name || b.productName} (×${b.quantity})`).join(", ")}
                      </div>
                    )}

                    <div className="cart-quantity-control">
                      <button
                        type="button"
                        disabled={item.quantity <= 1}
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>

                      <span>{item.quantity}</span>

                      <button
                        type="button"
                        disabled={item.product?.stock !== undefined && item.quantity >= item.product.stock}
                        onClick={() => {
                          if (item.product?.stock !== undefined && item.quantity >= item.product.stock) {
                            return
                          }
                          updateQuantity(item.id, item.quantity + 1)
                        }}
                        aria-label="Increase quantity"
                        title={item.product?.stock !== undefined && item.quantity >= item.product.stock ? 'Maximum stock reached' : undefined}
                      >
                        +
                      </button>

                      <button
                        type="button"
                        className="cart-remove-button"
                        onClick={() => removeFromCart(item.id)}
                        aria-label="Remove item"
                      >
                        <Trash2 size={13} style={{ verticalAlign: "middle", marginRight: 3 }} />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>

                <div className="cart-line-price">
                  <p>
                    ₹{item.unitPrice.toLocaleString("en-IN")} × {item.quantity}
                  </p>
                  <strong>₹{item.total.toLocaleString("en-IN")}</strong>
                </div>
              </article>
            );
          })}
        </div>

        {/* Summary Sidebar */}
        <aside className="checkout-summary">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#be185d", fontSize: "0.85rem", marginBottom: "0.8rem" }}>
            <Sparkles size={15} />
            <span>Prepaid Orders Only ✦ Pan India</span>
          </div>

          <p>
            Subtotal <strong>₹{subtotal.toLocaleString("en-IN")}</strong>
          </p>

          <p>
            Shipping <strong>{shipping === 0 ? "FREE" : `₹${shipping.toLocaleString("en-IN")}`}</strong>
          </p>

          <div style={{ borderTop: "1px dashed #e2d1d9", paddingTop: "0.75rem", marginTop: "0.5rem" }}>
            <span>Order Total</span>
            <strong>₹{total.toLocaleString("en-IN")}</strong>
          </div>

          <button
            type="button"
            className="button button-dark"
            style={{ width: "100%", marginTop: "1rem" }}
            onClick={() => navigate("/checkout")}
          >
            Proceed to Checkout <ArrowRight size={16} />
          </button>

          <Link
            to="/jewellery"
            style={{ display: "block", textAlign: "center", marginTop: "0.8rem", fontSize: "0.85rem", color: "#716269" }}
          >
            ← Continue Shopping
          </Link>
        </aside>
      </div>
    </section>
  );
}

export default Cart;
