import { useState } from "react";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { addCartItem } from "../../services/cartService";
import {
  isInWishlist,
  toggleWishlist,
} from "../../services/wishlistService";
import type { Product } from "../../types/product";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const [isWishlisted, setIsWishlisted] = useState(
    isInWishlist(product.id),
  );
  const navigate = useNavigate();

  const handleAddToCart = async () => {
    try {
      const savedSessionId =
        localStorage.getItem("hpt_session_id") ?? crypto.randomUUID();

      localStorage.setItem("hpt_session_id", savedSessionId);

      const savedCartId = localStorage.getItem("hpt_cart_id");

      const cart = await addCartItem({
        cartId: savedCartId ?? undefined,
        sessionId: savedSessionId,
        productId: product.id,
        quantity: 1,
      });

      localStorage.setItem("hpt_cart_id", cart.id);

      navigate("/cart");
    } catch (error) {
      console.error("Could not add product to cart:", error);
    }
  };

  return (
    <article className="product-card">
      <div className="product-image-wrapper">
        <Link
          to={`/product/${product.id}`}
          className="product-image-link"
          aria-label={`View ${product.name}`}
        >
          <img
            src={product.image}
            alt={product.name}
            className="product-image"
          />
        </Link>

        <button
          type="button"
          className={`wishlist-button ${isWishlisted ? "is-wishlisted" : ""
            }`}
          aria-label={
            isWishlisted
              ? `Remove ${product.name} from wishlist`
              : `Add ${product.name} to wishlist`
          }
          onClick={() => {
            const added = toggleWishlist(product);
            setIsWishlisted(added);
          }}
        >
          <Heart
            size={18}
            fill={isWishlisted ? "currentColor" : "none"}
          />
        </button>
      </div>

      <div className="product-info">
        <p className="product-category">{product.category}</p>

        <h3 className="product-name">
          <Link to={`/product/${product.id}`}>
            {product.name}
          </Link>
        </h3>

        <div className="product-rating">
          <Star size={15} fill="currentColor" />
          <span>{product.rating}</span>
        </div>

        <div className="product-bottom">
          <span className="product-price">
            ₹{product.price.toLocaleString("en-IN")}
          </span>

          <button
            type="button"
            className="add-cart-button"
            aria-label={`Add ${product.name} to cart`}
            onClick={handleAddToCart}
          >
            <ShoppingBag size={17} />
            <span>Add</span>
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;