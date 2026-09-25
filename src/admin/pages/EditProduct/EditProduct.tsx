import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import {
  deleteAdminProduct,
  deleteAdminProductImage,
  getAdminProduct,
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
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [stock, setStock] = useState("");

  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [currentImageRecords, setCurrentImageRecords] = useState<
    {
      id: string;
      url: string;
      altText: string | null;
      sortOrder: number;
    }[]
  >([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadProduct() {
      if (!productId) return;

      try {
        setLoading(true);

        const product = await getAdminProduct(productId);

        console.log(
          "Edit product image URLs:",
          product.images.map((image) => ({
            id: image.id,
            url: image.url,
          })),
        );

        setName(product.name ?? "");
        setCategory((product.category as Category) ?? "kawaii");
        setPrice(String(product.price ?? ""));
        setDescription(product.description ?? "");
        setStock(String(product.stock ?? ""));

        setCurrentImages(product.images?.map((image) => image.url) ?? []);

        setCurrentImageRecords(product.images ?? []);
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

      let images = currentImages;

      if (imageFiles.length > 0) {
        const uploadedImages = await uploadAdminProductImages(imageFiles);

        images = [...currentImages, ...uploadedImages];
      }

      await updateAdminProduct(productId, {
        name,
        category,
        price: Number(price),
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
        error instanceof Error ? error.message : "Could not update product.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!productId) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${name}"?`,
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
        error instanceof Error ? error.message : "Could not delete product.",
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
      <Link to={`/admin/products/${productId}`} className="product-back-button">
        <ArrowLeft size={17} />
        Back to Product
      </Link>

      <div className="edit-product-header">
        <div>
          <span className="admin-eyebrow">PRODUCT MANAGEMENT</span>

          <h1>Edit Product</h1>

          <p>Update your product details and images.</p>
        </div>
      </div>

      <form
        className="admin-product-form edit-product-form"
        onSubmit={handleSubmit}
      >
        <label>
          Product Name
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Enter product name"
            required
          />
        </label>

        <div className="edit-form-row">
          <label>
            Category
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value as Category)}
            >
              <option value="kawaii">Kawaii</option>
              <option value="jewellery">Jewellery</option>
              <option value="scoops">Scoops</option>
            </select>
          </label>

          <label>
            Price (₹)
            <input
              type="number"
              min="0"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              required
            />
          </label>

          <label>
            Stock
            <input
              type="number"
              min="0"
              value={stock}
              onChange={(event) => setStock(event.target.value)}
              required
            />
          </label>
        </div>

        <div className="edit-current-images">
          <div className="edit-field-title">Current Product Images</div>

          {currentImageRecords.length > 0 ? (
            <div className="edit-image-preview-grid">
              {currentImageRecords.map((image, index) => (
                <div className="edit-image-preview" key={image.id}>
                  <img
                    src={image.url}
                    alt={image.altText || `${name} ${index + 1}`}
                  />

                  <button
                    type="button"
                    className="edit-image-delete-button"
                    onClick={async () => {
                      if (!productId) return;

                      const confirmed = window.confirm(
                        "Are you sure you want to delete this image?",
                      );

                      if (!confirmed) return;

                      try {
                        setMessage("");

                        await deleteAdminProductImage(productId, image.id);

                        setCurrentImageRecords((previousImages) =>
                          previousImages.filter(
                            (currentImage) => currentImage.id !== image.id,
                          ),
                        );

                        setCurrentImages((previousImages) =>
                          previousImages.filter(
                            (imageUrl) => imageUrl !== image.url,
                          ),
                        );

                        setMessage("Image deleted successfully.");
                      } catch (error) {
                        console.error("Could not delete product image:", error);

                        setMessage(
                          error instanceof Error
                            ? error.message
                            : "Could not delete image.",
                        );
                      }
                    }}
                    disabled={saving || deleting}
                  >
                    <Trash2 size={15} />
                    Delete
                  </button>
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
          <small>
            Select new images only if you want to replace the existing images.
          </small>
        </label>

        {imageFiles.length > 0 && (
          <div className="selected-images-message">
            {imageFiles.length} new image
            {imageFiles.length > 1 ? "s" : ""} selected.
          </div>
        )}

        <label>
          Description
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

        {message && <p className="edit-product-message">{message}</p>}
      </form>
    </div>
  );
}

export default EditProduct;
