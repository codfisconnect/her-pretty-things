import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { getWishlist, toggleWishlist } from "../../services/wishlistService";
import { useState } from "react";
import "./Wishlist.css";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState(getWishlist());

  const handleRemove = (productId: string) => {
    const product = wishlist.find((item) => item.id === productId);

    if (!product) {
      return;
    }

    toggleWishlist(product);
    setWishlist(getWishlist());
  };

  return (
    <main className="wishlist-page container">
      <div className="wishlist-header">
        <h1>My Wishlist</h1>
        <p>
          {wishlist.length}{" "}
          {wishlist.length === 1 ? "item" : "items"}
        </p>
      </div>

      {wishlist.length === 0 ? (
        <div className="wishlist-empty">
          <Heart size={42} />
          <h2>Your wishlist is empty</h2>
          <p>Add your favourite things and find them here later.</p>

          <Link to="/jewellery" className="wishlist-shop-button">
            Explore Jewellery
          </Link>
        </div>
      ) : (
        <div className="wishlist-grid">
          {wishlist.map((product) => (
            <article className="wishlist-card" key={product.id}>
              <Link to={`/product/${product.id}`}>
                <img
                  src={product.image}
                  alt={product.name}
                  className="wishlist-image"
                />
              </Link>

              <div className="wishlist-info">
                <p>{product.category}</p>

                <h2>
                  <Link to={`/product/${product.id}`}>
                    {product.name}
                  </Link>
                </h2>

                <span>
                  ₹{product.price.toLocaleString("en-IN")}
                </span>

                <button
                  type="button"
                  onClick={() => handleRemove(product.id)}
                >
                  Remove
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
};

export default Wishlist;