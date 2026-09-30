import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingBag, ArrowRight, Plus, Minus } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext';
import { productService } from '../../services/productService';
import { ProductGrid } from '../../components/ProductGrid/ProductGrid';
import type { Product } from '../../types/Product';
import './ProductDetails.css';

export const ProductDetails: React.FC = () => {
  const { slug, category, id } = useParams<{ slug?: string; category?: string; id?: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedColour, setSelectedColour] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [addedNotice, setAddedNotice] = useState(false);
  const [loading, setLoading] = useState(true);

  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      let found: Product | undefined;

      if (slug) {
        found = await productService.getProductBySlug(slug);
      }
      if (!found && id) {
        found = await productService.getProductById(id);
      }
      // If still not found, check if slug was actually passed as id
      if (!found && slug) {
        found = await productService.getProductById(slug);
      }

      if (found) {
        setProduct(found);
        setSelectedImage(found.images[0] || found.image || '/src/assets/images/yusraa-hero-model.jpg');
        setSelectedColour(found.colour);
        const rel = await productService.getRelatedProducts(found.id, found.category);
        setRelated(rel);
      }
      setLoading(false);
    };

    loadProduct();
    window.scrollTo(0, 0);
  }, [slug, id, category]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '6rem 1rem' }}>Loading hijab details...</div>;
  }

  if (!product) {
    return (
      <div style={{ textAlign: 'center', padding: '6rem 1rem' }}>
        <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem' }}>Hijab Not Found</h2>
        <p style={{ color: '#666', marginBottom: '2rem' }}>
          The requested hijab could not be found or has been moved.
        </p>
        <Link to="/shop" className="hero-primary-btn">
          Explore All Hijabs
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedColour);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2500);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedColour);
    navigate('/checkout');
  };

  return (
    <div className="product-details-page">
      {/* Breadcrumb */}
      <nav className="details-breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to="/shop">Shop</Link>
        <span>/</span>
        <Link to={`/shop?category=${product.categorySlug}`}>{product.category}</Link>
        <span>/</span>
        <span style={{ color: '#1a1614', fontWeight: 600 }}>{product.name}</span>
      </nav>

      {/* Main Grid */}
      <div className="details-main-grid">
        {/* Gallery */}
        <div className="details-gallery">
          <div className="main-image-frame">
            <img
              src={selectedImage}
              alt={`YUSRAA ${product.name} - ${selectedColour}`}
              className="main-image-display"
            />
          </div>

          {product.images && product.images.length > 1 && (
            <div className="thumbnail-row" role="tablist" aria-label="Product thumbnails">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`thumbnail-btn ${selectedImage === img ? 'active' : ''}`}
                  onClick={() => setSelectedImage(img)}
                  aria-label={`View image ${idx + 1}`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${idx + 1} for ${product.name}`}
                    className="thumb-img"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info Column */}
        <div className="details-info-col">
          <span className="details-category-badge">{product.category}</span>
          <h1 className="details-product-title">{product.name}</h1>

          <div className="details-rating-row">
            <Star size={15} fill="#e5a93c" color="#e5a93c" />
            <span style={{ fontWeight: 700, color: '#1a1614' }}>{product.rating.toFixed(1)}</span>
            <span>({product.reviewsCount} verified customer reviews)</span>
          </div>

          <div className="details-price-row">
            <span className="details-current-price">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="details-original-price">{formatPrice(product.originalPrice)}</span>
            )}
          </div>

          <p className="details-description">{product.description}</p>

          {/* Colour Selection */}
          {product.availableColours && product.availableColours.length > 0 && (
            <div>
              <div className="details-option-title">
                Selected Shade: <span style={{ color: '#9b783e' }}>{selectedColour}</span>
              </div>
              <div className="details-colour-options">
                {product.availableColours.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    className={`details-colour-btn ${selectedColour === c.name ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedColour(c.name);
                      if (c.image) {
                        setSelectedImage(c.image);
                      }
                    }}
                  >
                    <span
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: c.hex,
                        display: 'inline-block',
                        border: '1px solid rgba(0,0,0,0.1)'
                      }}
                    />
                    <span>{c.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Row */}
          <div className="details-actions-row">
            {/* Quantity */}
            <div className="details-qty-picker">
              <button
                type="button"
                className="details-qty-btn"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                aria-label="Decrease quantity"
              >
                <Minus size={14} />
              </button>
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{quantity}</span>
              <button
                type="button"
                className="details-qty-btn"
                onClick={() => setQuantity(quantity + 1)}
                aria-label="Increase quantity"
              >
                <Plus size={14} />
              </button>
            </div>

            {/* Add to Cart */}
            <button
              type="button"
              id="details-add-to-cart-btn"
              className="details-add-btn"
              onClick={handleAddToCart}
            >
              <ShoppingBag size={17} />
              <span>{addedNotice ? 'Added to Bag ✓' : 'Add to Bag'}</span>
            </button>

            {/* Buy Now */}
            <button
              type="button"
              id="details-buy-now-btn"
              className="details-buy-btn"
              onClick={handleBuyNow}
            >
              <span>Buy Now</span>
              <ArrowRight size={17} />
            </button>
          </div>

          {/* Specifications Box */}
          <div className="details-spec-box">
            <h3 className="spec-title">Fabric &amp; Care Details</h3>
            <div className="spec-list">
              <div className="spec-row">
                <span className="spec-label">Fabric Composition:</span>
                <span className="spec-value">{product.fabric}</span>
              </div>
              <div className="spec-row">
                <span className="spec-label">Dimensions:</span>
                <span className="spec-value">{product.details.dimensions}</span>
              </div>
              <div className="spec-row">
                <span className="spec-label">Opacity Level:</span>
                <span className="spec-value">{product.details.opacity}</span>
              </div>
              <div className="spec-row">
                <span className="spec-label">Weave Texture:</span>
                <span className="spec-value">{product.details.texture}</span>
              </div>
              <div className="spec-row">
                <span className="spec-label">Care Instructions:</span>
                <span className="spec-value">{product.details.careInstructions.join(' • ')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Hijabs */}
      {related.length > 0 && (
        <section style={{ marginTop: '5rem' }}>
          <h2
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '2rem',
              textAlign: 'center',
              marginBottom: '2.5rem'
            }}
          >
            Pairs Elegantly With
          </h2>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
};
