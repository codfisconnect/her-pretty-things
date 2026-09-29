import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Heart, ShoppingBag, ArrowRight, ShieldCheck, Truck, RefreshCw } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { getProductById } from "../../services/productService";
import type { Product } from "../../types/product";
import "./ProductDetails.css";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showAllImages, setShowAllImages] = useState(false);
  const [adding, setAdding] = useState(false);

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
    try {
      setAdding(true);
      await addToCart({
        productId: id,
        quantity,
      });
      setTimeout(() => setAdding(false), 800);
    } catch (err) {
      console.error("Add to cart error:", err);
      setAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!id || !product) return;
    try {
      await addToCart({
        productId: id,
        quantity,
      });
      navigate("/checkout");
    } catch (err) {
      console.error("Buy now error:", err);
    }
  };

  if (loading) {
    return (
      <main className="product-details-page container">
        <div style={{ textAlign: "center", padding: "4rem 0" }}>
          <p>Loading pretty details...</p>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="product-details-page container">
        <button
          type="button"
          className="category-back-button"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>
        <div style={{ textAlign: "center", padding: "3rem 0" }}>
          <h1>Product not found</h1>
          <p>This item might have flown away to another lovely home.</p>
          <Link to="/jewellery" className="button button-dark" style={{ marginTop: "1rem" }}>
            Explore Jewellery
          </Link>
        </div>
      </main>
    );
  }

  const isJewellery = product.category === "jewellery";
  const isWishlisted = isInWishlist(product.id);
  const hasDiscount = product.mrp !== undefined && product.mrp !== null && product.mrp > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.mrp! - product.price) / product.mrp!) * 100)
    : 0;

  return (
    <main className="product-details-page container">
      <button
        type="button"
        className="category-back-button"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>

      <div className="product-details">
        {/* Images Gallery */}
        <div className="product-details-gallery">
          <div className="product-details-image-layout">
            <div className="product-details-thumbnails">
              {product.images && product.images.length > 0 ? (
                product.images.slice(0, 3).map((image, index) => (
                  <button
                    key={image}
                    type="button"
                    className={`product-details-thumbnail ${
                      selectedImage === index ? "active" : ""
                    }`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                    />
                  </button>
                ))
              ) : null}

              {product.images && product.images.length > 3 && (
                <button
                  type="button"
                  className="product-details-see-all"
                  onClick={() => setShowAllImages(true)}
                >
                  <span>+{product.images.length - 3}</span>
                  <small>See All</small>
                </button>
              )}
            </div>

            <div className="product-details-main-image" style={{ position: "relative" }}>
              {product.images && product.images[selectedImage] ? (
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                />
              ) : product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                />
              ) : (
                <div>No image available</div>
              )}

              {hasDiscount && (
                <span className="product-details-discount-pill">
                  {discountPercent}% OFF
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Info & Purchase */}
        <div className="product-details-info">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p className="eyebrow" style={{ margin: 0 }}>
              {isJewellery ? "Jewellery" : "Kawaii"}
            </p>
            <button
              type="button"
              className={`product-details-wishlist-btn ${isWishlisted ? "is-wishlisted" : ""}`}
              onClick={() => toggleWishlist(product)}
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} color={isWishlisted ? "#db2777" : "currentColor"} />
            </button>
          </div>

          <h1>{product.name}</h1>

          {/* Pricing Row */}
          <div className="product-details-price-row">
            <span className="product-details-price">
              ₹{product.price.toLocaleString("en-IN")}
            </span>
            {hasDiscount && (
              <>
                <span className="product-details-mrp">
                  ₹{product.mrp!.toLocaleString("en-IN")}
                </span>
                <span className="product-details-savings">
                  Save ₹{(product.mrp! - product.price).toLocaleString("en-IN")} ({discountPercent}%)
                </span>
              </>
            )}
          </div>

          {/* Stock status */}
          <div className="product-stock-status">
            <span className={`stock-dot ${product.stock > 0 ? "in-stock" : "out-of-stock"}`} />
            <span>{product.stock > 0 ? "In Stock ✦ Ready for Fast Dispatch" : "Out of Stock"}</span>
          </div>

          <div className="product-details-description">
            {product.description
              .split(/(?=Material:|Main Stones:|Accent Stones:|Design:|Finish:|Style:)/)
              .map((section, index) => {
                const match = section.match(
                  /^(Material|Main Stones|Accent Stones|Design|Finish|Style):\s*(.*)$/s,
                );

                if (match) {
                  return (
                    <div className="product-detail-row" key={index}>
                      <strong>{match[1]}</strong>
                      <span>{match[2]}</span>
                    </div>
                  );
                }

                return (
                  <p className="product-about" key={index}>
                    {section.trim()}
                  </p>
                );
              })}
          </div>

          {/* Quantity */}
          <div className="product-details-quantity">
            <span>Quantity</span>
            <div className="quantity-control">
              <button
                type="button"
                disabled={quantity <= 1 || product.stock <= 0}
                onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span>{quantity}</span>
              <button
                type="button"
                disabled={product.stock !== undefined && (quantity >= product.stock || product.stock <= 0)}
                onClick={() => {
                  if (product.stock !== undefined && quantity >= product.stock) return;
                  setQuantity((current) => current + 1);
                }}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="product-details-actions">
            <button
              type="button"
              className="product-add-cart"
              onClick={handleAddToCart}
              disabled={adding || product.stock <= 0}
            >
              <ShoppingBag size={17} />
              {product.stock <= 0 ? "OUT OF STOCK" : adding ? "ADDING TO CART..." : "ADD TO CART"}
            </button>

            <button
              type="button"
              className="product-buy-now"
              onClick={handleBuyNow}
              disabled={product.stock <= 0}
            >
              BUY IT NOW <ArrowRight size={16} />
            </button>
          </div>

          {/* Value Props & Care */}
          <div className="product-details-sections">
            <section className="product-feature-box">
              <div className="feature-icon-row">
                <Truck size={17} color="#db2777" />
                <strong>Pan India Delivery</strong>
              </div>
              <p>Prepaid orders only. Carefully packed and dispatched within 24-48 hours.</p>
            </section>

            <section className="product-feature-box">
              <div className="feature-icon-row">
                <RefreshCw size={17} color="#db2777" />
                <strong>Transit Replacement Policy</strong>
              </div>
              <p>
                In the rare event of transit damage, we offer full replacement. Please record an uncut unboxing video upon arrival.
              </p>
            </section>

            <section className="product-feature-box">
              <div className="feature-icon-row">
                <ShieldCheck size={17} color="#db2777" />
                <strong>{isJewellery ? "Jewellery Care" : "Product Care"}</strong>
              </div>
              <p>
                Store in a cool dry pouch away from moisture and perfumes to keep its pretty shine forever.
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

      {/* Modal for images */}
      {showAllImages && product.images && (
        <div
          className="product-image-modal"
          onClick={() => setShowAllImages(false)}
        >
          <div
            className="product-image-modal-content"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="product-image-modal-close"
              onClick={() => setShowAllImages(false)}
              aria-label="Close gallery"
            >
              ×
            </button>

            <div className="product-image-modal-grid">
              {product.images.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  className="product-image-modal-item"
                  onClick={() => {
                    setSelectedImage(index);
                    setShowAllImages(false);
                  }}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default ProductDetails;