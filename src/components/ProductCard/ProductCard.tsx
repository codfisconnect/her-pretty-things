import { Heart, ShoppingBag, Star } from "lucide-react";
import type { Product } from "../../types/product";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <article className="product-card">
      <div className="product-image-wrapper">
        <img
          src={product.image}
          alt={product.name}
          className="product-image"
        />

        <button
          type="button"
          className="wishlist-button"
          aria-label={`Add ${product.name} to wishlist`}
        >
          <Heart size={18} />
        </button>
      </div>

      <div className="product-info">
        <p className="product-category">{product.category}</p>

        <h3 className="product-name">{product.name}</h3>

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