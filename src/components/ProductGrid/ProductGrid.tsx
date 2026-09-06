import ProductCard from "../ProductCard/ProductCard";
import type { Product } from "../../types/product";

interface ProductGridProps {
  products: Product[];
}

const ProductGrid = ({ products }: ProductGridProps) => {
  if (products.length === 0) {
    return <p>No products found.</p>;
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;