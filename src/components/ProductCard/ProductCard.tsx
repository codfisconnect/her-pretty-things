import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext';
import type { Product } from '../../types/Product';
import './ProductCard.css';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  // Selected colour state, defaulting to primary product colour or first option
  const [selectedColour, setSelectedColour] = useState<string>(
    product.colour || product.availableColours?.[0]?.name || ''
  );

  // Compute the image corresponding to the selected colour
  const getCurrentImage = (): string => {
    if (product.availableColours && product.availableColours.length > 0) {
      const foundColour = product.availableColours.find(c => c.name === selectedColour);
      if (foundColour?.image) {
        return foundColour.image;
      }
      const colourIdx = product.availableColours.findIndex(c => c.name === selectedColour);
      if (colourIdx >= 0 && product.images?.[colourIdx]) {
        return product.images[colourIdx];
      }
    }
    return product.images?.[0] || product.image || '/src/assets/images/yusraa-hero-model.jpg';
  };

  const handleColourClick = (e: React.MouseEvent, colourName: string) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedColour(colourName);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1, selectedColour || product.colour);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1, selectedColour || product.colour);
    navigate('/checkout');
  };

  const productUrl = `/shop/${product.categorySlug}/${product.slug}`;
  const currentImage = getCurrentImage();
  const activeColourName = selectedColour || product.colour;

  return (
    <article className="product-card" id={`product-card-${product.id}`}>
      <Link to={productUrl} className="product-image-container" tabIndex={-1} aria-hidden="true">
        <img
          src={currentImage}
          alt={`Yusraa ${product.name} in ${activeColourName}`}
          className="product-card-img"
          loading="lazy"
        />
        {product.isBestSeller && (
          <span className="product-badge-tag bestseller">Best Seller</span>
        )}
        {!product.isBestSeller && product.isFeatured && (
          <span className="product-badge-tag">Premium</span>
        )}
      </Link>

      <div className="product-card-body">
        <span className="product-card-category">{product.category}</span>

        <h3 style={{ margin: 0, padding: 0 }}>
          <Link to={productUrl} className="product-card-title">
            {product.name}
          </Link>
        </h3>

        <div className="product-card-rating">
          <Star size={13} className="star-icon-filled" aria-hidden="true" />
          <span>{product.rating.toFixed(1)}</span>
          <span>({product.reviewsCount})</span>
        </div>

        {product.availableColours && product.availableColours.length > 0 && (
          <div
            className="product-colours-row"
            role="group"
            aria-label={`Available colours for ${product.name}, currently selected ${activeColourName}`}
          >
            {product.availableColours.slice(0, 4).map((c, i) => {
              const isSelected = activeColourName === c.name;
              return (
                <button
                  key={i}
                  type="button"
                  className={`colour-dot-btn ${isSelected ? 'active' : ''}`}
                  style={{ backgroundColor: c.hex }}
                  onClick={(e) => handleColourClick(e, c.name)}
                  title={c.name}
                  aria-label={`Select ${c.name} colour variant for ${product.name}`}
                  aria-pressed={isSelected}
                />
              );
            })}
          </div>
        )}

        <div className="product-card-price-row">
          <span className="product-card-price">{formatPrice(product.price)}</span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="product-card-original-price">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        <div className="product-card-actions">
          <button
            type="button"
            className="product-cart-btn"
            id={`add-to-cart-${product.id}`}
            onClick={handleAddToCart}
            aria-label={`Add ${product.name} in ${activeColourName} to cart`}
          >
            <ShoppingBag size={14} aria-hidden="true" />
            <span>Add</span>
          </button>

          <button
            type="button"
            className="product-buynow-btn"
            id={`buy-now-${product.id}`}
            onClick={handleBuyNow}
            aria-label={`Buy ${product.name} in ${activeColourName} now`}
          >
            <span>Buy Now</span>
            <ArrowRight size={13} aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
};

