import React, { useState } from "react";
import { Heart, ShoppingBag, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { useWishlist } from "../../context/WishlistContext";
import { useCart } from "../../context/CartContext";
import type { Product } from "../../types/product";
import "./ProductCard.css";
import { optimizeCloudinaryImage } from "../../utils/cloudinary";

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);

  const isWishlisted = isInWishlist(product.id);

  const hasDiscount = product.mrp !== undefined && product.mrp !== null && product.mrp > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.mrp! - product.price) / product.mrp!) * 100)
    : 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setAdding(true);
      await addToCart({
        productId: product.id,
        quantity: 1,
      });
      setTimeout(() => setAdding(false), 900);
    } catch (error) {
      console.error("Could not add product to cart:", error);
      setAdding(false);
    }
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
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
            src={optimizeCloudinaryImage(product.image, 500)}
            alt={product.name}
            className="product-image"
            loading="lazy"
            decoding="async"
          />
          {hasDiscount && (
            <span className="product-card-discount-badge">
              {discountPercent}% OFF
            </span>
          )}
        </Link>
      </div>

      <div className="product-info">
        <div className="product-category-row">
          <p className="product-category">{product.category}</p>

          <button
            type="button"
            className={`wishlist-button ${isWishlisted ? "is-wishlisted" : ""
              }`}
            aria-label={
              isWishlisted
                ? `Remove ${product.name} from wishlist`
                : `Add ${product.name} to wishlist`
            }
            onClick={handleWishlistClick}
          >
            <Heart
              size={15}
              fill={isWishlisted ? "currentColor" : "none"}
              color={isWishlisted ? "#db2777" : "currentColor"}
            />
          </button>
        </div>

        <h3 className="product-name">
          <Link to={`/product/${product.id}`}>
            {product.name}
          </Link>
        </h3>

        <div className="product-bottom">
          <div className="product-pricing">
            <span className="product-price">
              ₹{product.price.toLocaleString("en-IN")}
            </span>
            {hasDiscount && (
              <span className="product-mrp-price">
                ₹{product.mrp!.toLocaleString("en-IN")}
              </span>
            )}
          </div>

          <button
            type="button"
            className={`add-cart-button ${adding ? "added" : ""} ${product.stock <= 0 ? "out-of-stock" : ""}`}
            aria-label={product.stock <= 0 ? `${product.name} is out of stock` : `Add ${product.name} to cart`}
            onClick={handleAddToCart}
            disabled={adding || product.stock <= 0}
          >
            {product.stock <= 0 ? (
              <span>Out</span>
            ) : adding ? (
              <>
                <Check size={13} />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingBag size={13} />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;