import "./ProductManagement.css";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Edit3, Trash2 } from "lucide-react";
import { getProductById } from "../../../services/productService";
import { apiRequest } from "../../../services/api";
import type { Product } from "../../../types/product";

function ProductManagement() {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showImagePreview, setShowImagePreview] = useState(false);

  useEffect(() => {
    if (!productId) return;

    getProductById(productId)
      .then(setProduct)
      .catch((err) => {
        console.error(err);
        setError("Could not load product.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [productId]);

  async function handleDelete() {
    if (!productId || !product) return;

    const confirmed = window.confirm(
      `Are you sure you want to remove "${product.name}"?`,
    );

    if (!confirmed) return;

    try {
      setDeleting(true);

      await apiRequest(`/admin/products/${encodeURIComponent(productId)}`, {
        method: "DELETE",
      });

      navigate("/admin/products");
    } catch (err) {
      console.error(err);
      setError("Could not delete product.");
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="admin-page">
        <div className="products-loading">Loading product...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="admin-page">
        <div className="products-error">{error || "Product not found."}</div>

        <Link to="/admin/products" className="product-back-button">
          <ArrowLeft size={17} />
          Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="admin-page product-management-page">
      <Link to="/admin/products" className="product-back-button">
        <ArrowLeft size={17} />
        Back to Products
      </Link>

      <div className="product-management-card">
        <div className="product-management-image">
          {product.images && product.images.length > 0 ? (
            <div className="product-management-image-carousel">
              <button
                type="button"
                className="product-management-image-arrow product-management-image-arrow-left"
                onClick={() => {
                  const track = document.querySelector(
                    ".product-management-image-track",
                  );

                  if (track) {
                    track.scrollBy({
                      left: -160,
                      behavior: "smooth",
                    });
                  }
                }}
                aria-label="Previous image"
              >
                ‹
              </button>

              <div className="product-management-image-track">
                {product.images.map((image, index) => (
                  <button
                    type="button"
                    className={`product-management-image-item ${
                      selectedImageIndex === index ? "active" : ""
                    }`}
                    key={`${image}-${index}`}
                    onClick={() => {
                      setSelectedImageIndex(index);
                      setShowImagePreview(true);
                    }}
                  >
                    <img src={image} alt={`${product.name} ${index + 1}`} />
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="product-management-image-arrow product-management-image-arrow-right"
                onClick={() => {
                  const track = document.querySelector(
                    ".product-management-image-track",
                  );

                  if (track) {
                    track.scrollBy({
                      left: 160,
                      behavior: "smooth",
                    });
                  }
                }}
                aria-label="Next image"
              >
                ›
              </button>
            </div>
          ) : product.image ? (
            <button
              type="button"
              className="product-management-image-item active"
              onClick={() => {
                setSelectedImageIndex(0);
                setShowImagePreview(true);
              }}
            >
              <img src={product.image} alt={product.name} />
            </button>
          ) : (
            <span>No image</span>
          )}
        </div>

        <div className="product-management-content">
          <span className="product-management-category">
            {product.category}
          </span>

          <h1>{product.name}</h1>

          <div className="product-management-price">₹{product.price}</div>

          <div className="product-management-stock">Stock: {product.stock}</div>

          <div className="product-management-description">
            <h3>Description</h3>
            <p>{product.description || "No description available."}</p>
          </div>

          <div className="product-management-actions">
            <Link
              to={`/admin/products/${product.id}/edit`}
              className="product-edit-button"
            >
              <Edit3 size={17} />
              Edit Product
            </Link>

            <button
              type="button"
              className="product-delete-button"
              onClick={handleDelete}
              disabled={deleting}
            >
              <Trash2 size={17} />
              {deleting ? "Deleting..." : "Delete Product"}
            </button>
          </div>
        </div>
      </div>

      {showImagePreview && product.images && product.images.length > 0 && (
        <div
          className="product-image-preview-overlay"
          onClick={() => setShowImagePreview(false)}
        >
          <div
            className="product-image-preview-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="product-image-preview-close"
              onClick={() => setShowImagePreview(false)}
              aria-label="Close image preview"
            >
              ×
            </button>

            <button
              type="button"
              className="product-image-preview-arrow product-image-preview-arrow-left"
              onClick={() => {
                setSelectedImageIndex((currentIndex) =>
                  currentIndex === 0
                    ? product.images.length - 1
                    : currentIndex - 1,
                );
              }}
              aria-label="Previous image"
            >
              ‹
            </button>

            <img
              className="product-image-preview-large"
              src={product.images[selectedImageIndex]}
              alt={`${product.name} ${selectedImageIndex + 1}`}
            />

            <button
              type="button"
              className="product-image-preview-arrow product-image-preview-arrow-right"
              onClick={() => {
                setSelectedImageIndex((currentIndex) =>
                  currentIndex === product.images.length - 1
                    ? 0
                    : currentIndex + 1,
                );
              }}
              aria-label="Next image"
            >
              ›
            </button>

            <div className="product-image-preview-counter">
              {selectedImageIndex + 1} / {product.images.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductManagement;
