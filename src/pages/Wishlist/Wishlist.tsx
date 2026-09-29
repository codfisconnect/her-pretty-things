import { Heart, ShoppingBag, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useWishlist } from "../../context/WishlistContext";
import { useCart } from "../../context/CartContext";
import type { Product } from "../../types/product";
import "./Wishlist.css";

const Wishlist = () => {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleAddToCart = async (product: Product) => {
    try {
      await addToCart({
        productId: product.id,
        quantity: 1,
      });
    } catch (err) {
      console.error("Could not add to cart:", err);
    }
  };

  return (
    <main className="wishlist-page container">
      <div className="wishlist-header">
        <h1>My Wishlist</h1>
        <p>
          {wishlist.length} {wishlist.length === 1 ? "item" : "items"}
        </p>
      </div>

      {wishlist.length === 0 ? (
        <div className="wishlist-empty">
          <Heart size={44} strokeWidth={1.5} />
          <h2>Your wishlist is empty</h2>
          <p>Add your favourite things and find them here later.</p>

          <Link to="/jewellery" className="button button-dark" style={{ marginTop: '1rem' }}>
            Explore Jewellery <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="wishlist-grid">
          {wishlist.map((product) => {
            const hasDiscount = product.mrp && product.mrp > product.price;
            const discountPercent = hasDiscount
              ? Math.round(((product.mrp! - product.price) / product.mrp!) * 100)
              : 0;

            return (
              <article className="wishlist-card" key={product.id}>
                <Link to={`/product/${product.id}`} className="wishlist-image-link">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="wishlist-image"
                  />
                  {hasDiscount && (
                    <span className="product-discount-badge">
                      {discountPercent}% OFF
                    </span>
                  )}
                </Link>

                <div className="wishlist-info">
                  <p className="wishlist-cat">{product.category}</p>

                  <h2>
                    <Link to={`/product/${product.id}`}>{product.name}</Link>
                  </h2>

                  <div className="wishlist-price-row">
                    <span className="selling-price">
                      ₹{product.price.toLocaleString("en-IN")}
                    </span>
                    {hasDiscount && (
                      <span className="mrp-price">
                        ₹{product.mrp!.toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>

                  <div className="wishlist-actions">
                    <button
                      type="button"
                      className="wishlist-add-cart"
                      onClick={() => handleAddToCart(product)}
                    >
                      <ShoppingBag size={14} />
                      Add to Cart
                    </button>

                    <button
                      type="button"
                      className="wishlist-remove-btn"
                      onClick={() => removeFromWishlist(product.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
};

export default Wishlist;