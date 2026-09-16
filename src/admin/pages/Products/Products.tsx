import "./Products.css";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, ChevronRight } from "lucide-react";
import { getProducts } from "../../../services/productService";
import type { Product } from "../../../types/product";

const categories = [
  {
    key: "scoops",
    title: "Scoops",
  },
  {
    key: "jewellery",
    title: "Jewellery",
  },
  {
    key: "kawaii",
    title: "Kawaii",
  },
] as const;

function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch((error) => {
        console.error("Could not load products:", error);
        setMessage("Could not load products.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="admin-page products-admin-page">
        <div className="products-loading">
          Loading products...
        </div>
      </div>
    );
  }

  if (message) {
    return (
      <div className="admin-page products-admin-page">
        <div className="products-error">
          {message}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page products-admin-page">
      <div className="products-admin-header">
        <div>
          <span className="admin-eyebrow">
            HER PRETTY THINGS
          </span>

          <h1>Products</h1>

          <p>
            Manage your store collection.
          </p>
        </div>

        <Link
          to="/admin/products/add"
          className="products-add-button"
        >
          <Plus size={17} />
          Add Product
        </Link>
      </div>

      <div className="product-category-sections">
        {categories.map((category) => {
          const categoryProducts = products.filter(
            (product) =>
              product.category.toLowerCase() === category.key
          );

          const visibleProducts =
            categoryProducts.slice(0, 5);

          return (
            <section
              className="admin-product-category-section"
              key={category.key}
            >
              <div className="product-category-header">
                <div>
                  <h2>{category.title}</h2>

                  <span>
                    {categoryProducts.length}{" "}
                    {categoryProducts.length === 1
                      ? "product"
                      : "products"}
                  </span>
                </div>

                {categoryProducts.length > 5 && (
                  <button
                    type="button"
                    className="category-view-all"
                  >
                    View all
                    <ChevronRight size={16} />
                  </button>
                )}
              </div>

              {visibleProducts.length > 0 ? (
                <div className="admin-product-grid">
                  {visibleProducts.map((product) => (
                    <Link
                      key={product.id}
                      to={`/admin/products/${product.id}`}
                      className="admin-product-tile"
                    >
                      <div className="admin-product-tile-image">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                          />
                        ) : (
                          <span>No image</span>
                        )}
                      </div>

                      <div className="admin-product-tile-info">
                        <h3>{product.name}</h3>

                        <div className="admin-product-tile-meta">
                          <strong>
                            ₹{product.price}
                          </strong>

                          <span>
                            Stock: {product.stock}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="empty-category">
                  No {category.title.toLowerCase()} products yet.
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}

export default Products;