import { Link, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { addCartItem } from "../../services/cartService";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = async () => {
    const savedSessionId =
  localStorage.getItem('hpt_session_id') ?? crypto.randomUUID()

localStorage.setItem('hpt_session_id', savedSessionId)

const savedCartId = localStorage.getItem('hpt_cart_id')

const cart = await addCartItem({
  cartId: savedCartId ?? undefined,
  sessionId: savedSessionId,
  productId: id,
  quantity,
});

    localStorage.setItem("hpt_cart_id", cart.id);
    navigate("/cart");
  };

  const isCherryEarrings = id === "glossy-red-cherry-drop-earrings";

  const product = isCherryEarrings
    ? {
        name: "Glossy Red Cherry Drop Earrings",
        image: "/images/glossy-red-cherry-drop-earrings.png",
        price: "₹999",
        description:
          "A bold little pop of cherry red for your everyday pretty moments. ♡ These glossy drop earrings are designed to add a playful statement to any outfit.",
        highlights: ["Lightweight", "Statement Wear", "Glossy Finish"],
        details: (
          <>
            Material: Alloy
            <br />
            Finish: Glossy Red
            <br />
            Style: Cherry Drop Earrings
            <br />
            Weight: Lightweight
            <br />
            Occasion: Daily wear, outings, festive occasions & parties
          </>
        ),
      }
    : {
        name: "Gold-Tone Floral Necklace & Earrings Set",
        image: "/images/gold-floral-necklace.png",
        price: "₹699",
        description:
          "A little floral sparkle for your everyday pretty moments. ♡ A delicate gold-tone necklace paired with matching floral earrings, designed to add an elegant touch without feeling too heavy.",
        highlights: ["Anti-Tarnish", "Lightweight", "Complete Set"],
        details: (
          <>
            Material: Alloy
            <br />
            Finish: Gold-tone
            <br />
            Set Includes: 1 Necklace + 1 Pair of Earrings
            <br />
            Style: Floral
            <br />
            Weight: Lightweight
            <br />
            Occasion: Daily wear, outings, festive occasions & parties
          </>
        ),
      };

  return (
    <main className="product-details-page container">
      <div className="product-details">
        <div className="product-details-gallery">
          <div className="product-details-main-image">
            <img src={product.image} alt={product.name} />
          </div>
        </div>

        <div className="product-details-info">
          <p className="eyebrow">Jewellery</p>

          <h1>{product.name}</h1>

          <p className="product-details-price">{product.price}</p>

          <p className="product-details-description">{product.description}</p>

          <div className="product-details-highlights">
            {product.highlights.map((highlight) => (
              <span key={highlight}>{highlight}</span>
            ))}
          </div>

          <div className="product-details-quantity">
            <span>Quantity</span>

            <div className="quantity-control">
              <button
                type="button"
                onClick={() =>
                  setQuantity((current) => Math.max(1, current - 1))
                }
              >
                −
              </button>

              <span>{quantity}</span>

              <button
                type="button"
                onClick={() => setQuantity((current) => current + 1)}
              >
                +
              </button>
            </div>
          </div>

          <div className="product-details-actions">
            <button
              type="button"
              className="product-add-cart"
              onClick={handleAddToCart}
            >
              ADD TO CART
            </button>

            <button type="button" className="product-buy-now">
              BUY IT NOW
            </button>
          </div>

          <div className="product-details-sections">
            <section>
              <h2>Product Details</h2>

              <p>{product.details}</p>
            </section>

            <section>
              <h2>Jewellery Care</h2>

              <p>
                Keep your jewellery away from water, perfume, sweat and harsh
                chemicals. Store it in a dry place or jewellery pouch when not
                in use.
              </p>
            </section>

            <section>
              <h2>Shipping & Returns</h2>

              <p>
                Pan India Delivery
                <br />
                Fast Dispatch
                <br />
                Prepaid Orders Only
              </p>
            </section>
          </div>

          <Link to="/jewellery" className="product-back-link">
            ← Back to Jewellery
          </Link>
        </div>
      </div>
    </main>
  );
}

export default ProductDetails;
