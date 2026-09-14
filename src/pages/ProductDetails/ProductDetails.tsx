import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { addCartItem } from "../../services/cartService";
import { getProductById } from "../../services/productService";
import type { Product } from "../../types/product";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    setLoading(true);

    getProductById(id)
      .then(setProduct)
      .catch((error) => {
        console.error("Could not load product:", error);
        setProduct(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const handleAddToCart = async () => {
    if (!id || !product) return;

    const savedSessionId =
      localStorage.getItem("hpt_session_id") ?? crypto.randomUUID();

    localStorage.setItem("hpt_session_id", savedSessionId);

    const savedCartId = localStorage.getItem("hpt_cart_id");

    const cart = await addCartItem({
      cartId: savedCartId ?? undefined,
      sessionId: savedSessionId,
      productId: id,
      quantity,
    });

    localStorage.setItem("hpt_cart_id", cart.id);
    navigate("/cart");
  };

  if (loading) {
    return (
      <main className="product-details-page container">
        <p>Loading product...</p>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="product-details-page container">
        <h1>Product not found</h1>

        <Link to="/kawaii" className="product-back-link">
          ← Back to Kawaii
        </Link>
      </main>
    );
  }

  const isJewellery = product.category === "jewellery";

  return (
    <main className="product-details-page container">
      <div className="product-details">
        <div className="product-details-gallery">
          <div className="product-details-main-image">
            {product.image ? (
              <img src={product.image} alt={product.name} />
            ) : (
              <div>No image available</div>
            )}
          </div>
        </div>

        <div className="product-details-info">
          <p className="eyebrow">
            {isJewellery ? "Jewellery" : "Kawaii"}
          </p>

          <h1>{product.name}</h1>

          <p className="product-details-price">
            ₹{product.price}
          </p>

          <p className="product-details-description">
            {product.description}
          </p>

          <div className="product-details-highlights">
            <span>
              {isJewellery ? "Jewellery" : "Kawaii"}
            </span>

            <span>Quality Product</span>
          </div>

          <div className="product-details-quantity">
            <span>Quantity</span>

            <div className="quantity-control">
              <button
                type="button"
                onClick={() =>
                  setQuantity((current) =>
                    Math.max(1, current - 1)
                  )
                }
              >
                −
              </button>

              <span>{quantity}</span>

              <button
                type="button"
                onClick={() =>
                  setQuantity((current) => current + 1)
                }
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

            <button
              type="button"
              className="product-buy-now"
            >
              BUY IT NOW
            </button>
          </div>

          <div className="product-details-sections">
            <section>
              <h2>Product Details</h2>

              <p>
                {product.description}
              </p>
            </section>

            <section>
              <h2>
                {isJewellery
                  ? "Jewellery Care"
                  : "Product Care"}
              </h2>

              <p>
                Handle your product with care and store it
                safely when not in use.
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

          <Link
            to={isJewellery ? "/jewellery" : "/kawaii"}
            className="product-back-link"
          >
            ← Back to {isJewellery ? "Jewellery" : "Kawaii"}
          </Link>
        </div>
      </div>
    </main>
  );
}

export default ProductDetails;