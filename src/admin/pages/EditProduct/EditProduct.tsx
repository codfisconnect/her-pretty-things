import { useEffect, useState, useMemo } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { getProductById } from "../../../services/productService";
import {
  deleteAdminProduct,
  updateAdminProduct,
  uploadAdminProductImages,
} from "../../../services/adminService";
import "./EditProduct.css";

type Category = "scoops" | "jewellery" | "kawaii";

function EditProduct() {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [category, setCategory] = useState<Category>("kawaii");
  const [mrp, setMrp] = useState("");
  const [price, setPrice] = useState("");
  const [sku, setSku] = useState("");
  const [byobEligible, setByobEligible] = useState(true);
  const [description, setDescription] = useState("");
  const [stock, setStock] = useState("");

  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");

  const discountInfo = useMemo(() => {
    const numMrp = parseFloat(mrp);
    const numPrice = parseFloat(price);
    if (!isNaN(numMrp) && !isNaN(numPrice) && numMrp > numPrice && numPrice >= 0) {
      const amount = Math.round((numMrp - numPrice) * 100) / 100;
      const percent = Math.round(((numMrp - numPrice) / numMrp) * 100);
      return { amount, percent };
    }
    return null;
  }, [mrp, price]);

  useEffect(() => {
    async function loadProduct() {
      if (!productId) return;

      try {
        setLoading(true);
        const product = await getProductById(productId);

        setName(product.name ?? "");
        setCategory((product.category as Category) ?? "kawaii");
        setMrp(product.mrp !== undefined && product.mrp !== null ? String(product.mrp) : "");
        setPrice(String(product.price ?? ""));
        setSku((product as any).sku ?? "");
        setByobEligible(product.byobEligible ?? true);
        setDescription(product.description ?? "");
        setStock(String(product.stock ?? ""));

        const images =
          product.images && product.images.length > 0
            ? product.images
            : product.image
              ? [product.image]
              : [];

        setCurrentImages(images);
      } catch (error) {
        console.error("Could not load product:", error);
        setMessage("Could not load product.");
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [productId]);

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    setImageFiles(Array.from(event.target.files ?? []));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!productId) return;

    try {
      setSaving(true);
      setMessage("");

      const numMrp = mrp ? Number(mrp) : undefined;
      const numPrice = Number(price);

      if (numMrp !== undefined && numPrice > numMrp) {
        throw new Error("Selling price cannot exceed MRP.");
      }

      let images = currentImages;

      if (imageFiles.length > 0) {
        const uploaded = await uploadAdminProductImages(imageFiles);
        if (uploaded.length > 0) {
          images = uploaded;
        }
      }

      await updateAdminProduct(productId, {
        name,
        category,
        mrp: numMrp,
        price: numPrice,
        sku: sku.trim() || undefined,
        byobEligible: category !== "scoops" ? byobEligible : false,
        description,
        stock: Number(stock),
        images,
      });

      setMessage("Product updated successfully.");

      setTimeout(() => {
        navigate(`/admin/products/${productId}`);
      }, 700);
    } catch (error) {
      console.error("Could not update product:", error);
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not update product."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!productId) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${name}"?`
    );

    if (!confirmed) return;

    try {
      setDeleting(true);
      setMessage("");

      await deleteAdminProduct(productId);
      navigate("/admin/products");
    } catch (error) {
      console.error("Could not delete product:", error);
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not delete product."
      );
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

  return (
    <div className="admin-page edit-product-page">
      <Link
        to={`/admin/products/${productId}`}
        className="product-back-button"
      >
        <ArrowLeft size={17} />
        Back to Product
      </Link>

      <div className="edit-product-header">
        <div>
          <span className="admin-eyebrow">PRODUCT MANAGEMENT</span>
          <h1>Edit Product</h1>
          <p>Update product pricing, stock, SKU, BYOB eligibility, and images.</p>
        </div>
      </div>

      <form
        className="admin-product-form edit-product-form"
        onSubmit={handleSubmit}
      >
        <label>
          Product Name *
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Enter product name"
            required
          />
        </label>

        <div>
          <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#4b3f46', marginBottom: '0.4rem' }}>
            Category * (Current: <strong style={{ color: '#db2777', textTransform: 'capitalize' }}>{category}</strong>)
          </span>
          <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            {[
              { id: 'kawaii', label: '🐰 Kawaii' },
              { id: 'jewellery', label: '✧ Jewellery' },
              { id: 'scoops', label: '🍨 Scoops' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  const val = cat.id as Category
                  setCategory(val)
                  if (val === 'scoops') setByobEligible(false)
                }}
                style={{
                  padding: '0.55rem 1.1rem',
                  borderRadius: '999px',
                  border: category === cat.id ? '2px solid #db2777' : '1px solid #e2d1d9',
                  background: category === cat.id ? '#fdf2f8' : '#ffffff',
                  color: category === cat.id ? '#db2777' : '#574850',
                  fontWeight: category === cat.id ? 700 : 500,
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  transition: 'all 0.15s ease',
                }}
              >
                {cat.label}
                {category === cat.id && <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>✓</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="edit-form-row">
          <label>
            MRP / Original Price (₹)
            <input
              type="number"
              min="0"
              value={mrp}
              onChange={(event) => setMrp(event.target.value)}
              placeholder="999"
            />
          </label>

          <label>
            Selling Price (₹) *
            <input
              type="number"
              min="0"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              required
            />
          </label>

          <label>
            Stock *
            <input
              type="number"
              min="0"
              value={stock}
              onChange={(event) => setStock(event.target.value)}
              required
            />
          </label>
        </div>

        {discountInfo && (
          <div style={{
            background: '#fdf2f8',
            border: '1px solid #fbcfe8',
            padding: '0.65rem 1rem',
            borderRadius: 8,
            fontSize: '0.85rem',
            color: '#be185d',
            fontWeight: 600
          }}>
            ✦ Auto-calculated Discount: ₹{discountInfo.amount} OFF ({discountInfo.percent}% OFF)
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
          <label>
            SKU Code
            <input
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="e.g. HPT-KAW-042"
            />
          </label>

          {category !== 'scoops' && (
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '1.8rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={byobEligible}
                onChange={(e) => setByobEligible(e.target.checked)}
                style={{ width: 'auto' }}
              />
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                Eligible for BYOB Box
              </span>
            </label>
          )}
        </div>

        <div className="edit-current-images">
          <div className="edit-field-title">Current Product Images</div>
          {currentImages.length > 0 ? (
            <div className="edit-image-preview-grid">
              {currentImages.map((image, index) => (
                <div className="edit-image-preview" key={`${image}-${index}`}>
                  <img src={image} alt={`${name} ${index + 1}`} />
                </div>
              ))}
            </div>
          ) : (
            <div className="edit-no-image">No product images</div>
          )}
        </div>

        <label>
          Replace Product Images
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
          />
          <small>Select new images only if you want to replace existing images.</small>
        </label>

        {imageFiles.length > 0 && (
          <div className="selected-images-message">
            {imageFiles.length} new image{imageFiles.length > 1 ? "s" : ""} selected.
          </div>
        )}

        <label>
          Description *
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Enter product description"
            rows={7}
            required
          />
        </label>

        <div className="edit-product-actions">
          <button
            type="submit"
            className="product-save-button"
            disabled={saving || deleting}
          >
            <Save size={17} />
            {saving ? "Saving Changes..." : "Save Changes"}
          </button>

          <button
            type="button"
            className="product-delete-button"
            onClick={handleDelete}
            disabled={saving || deleting}
          >
            <Trash2 size={17} />
            {deleting ? "Deleting..." : "Delete Product"}
          </button>
        </div>

        {message && (
          <p className="edit-product-message" style={{ color: message.includes('success') ? '#047857' : '#e11d48' }}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
}

export default EditProduct;