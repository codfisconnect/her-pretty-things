import { ArrowRight, ChevronRight, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProducts } from "../../services/productService";
import BrandExperience from "../../components/BrandExperience/BrandExperience";
import CategoryCard, {
  type Category,
} from "../../components/CategoryCard/CategoryCard";
import Hero from "../../components/Hero/Hero";
import ProductCard from "../../components/ProductCard/ProductCard";
import SocialGallery from "../../components/SocialGallery/SocialGallery";
import type { Product } from "../../types/product";

const categories: Category[] = [
  {
    name: "Scoops",
    slug: "scoops",
    description: "Little surprises waiting to be discovered.",
    accent: "category-pink",
    icon: "🍨",
  },
  {
    name: "Jewellery",
    slug: "jewellery",
    description: "Pretty pieces for every little moment.",
    accent: "category-lilac",
    icon: "✧",
  },
  {
    name: "Kawaii",
    slug: "kawaii",
    description: "Cute finds you'll want to keep forever.",
    accent: "category-yellow",
    icon: "🐰",
  },
];

function Home() {
  const [scoopProducts, setScoopProducts] = useState<Product[]>([]);
  const [jewelleryProducts, setJewelleryProducts] = useState<Product[]>([]);
  const [kawaiiProducts, setKawaiiProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        setError(false);

        const [scoops, jewellery, kawaii] = await Promise.all([
          getProducts("scoops"),
          getProducts("jewellery"),
          getProducts("kawaii"),
        ]);

        setScoopProducts(scoops);
        setJewelleryProducts(jewellery);
        setKawaiiProducts(kawaii);
      } catch (error) {
        console.error("Could not load homepage products:", error);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  const oneScoop = scoopProducts[0];

  return (
    <>
      <Hero />

      <main>
        <section className="section container category-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Made to make you smile</p>
              <h2>Shop Your Pretty Picks</h2>
            </div>

            <Link className="text-link desktop-link" to="/scoops">
              View all <ArrowRight size={16} />
            </Link>
          </div>

          <div className="category-grid">
            {categories.map((category) => (
              <CategoryCard key={category.name} category={category} />
            ))}
          </div>
        </section>

        <section className="section featured-section">
          <div className="container">
            <div className="section-heading">
              <div>
                <p className="eyebrow">
                  <Sparkles size={14} /> Handpicked favourites
                </p>
                <h2>Pretty Picks For You</h2>
              </div>

              <Link className="text-link desktop-link" to="/scoops">
                Shop everything <ArrowRight size={16} />
              </Link>
            </div>

            {loading && (
              <div className="product-grid">
                <p>Loading pretty picks...</p>
              </div>
            )}

            {!loading && error && (
              <div className="product-grid">
                <p>Could not load products. Please try again.</p>
              </div>
            )}

            {!loading && !error && (
              <>
                {/* First row: exactly one Scoop + Jewellery */}
                <div className="product-grid">
                  {oneScoop && (
                    <ProductCard
                      key={oneScoop.id}
                      product={oneScoop}
                    />
                  )}

                  {jewelleryProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                    />
                  ))}
                </div>

                {/* Second row: Kawaii only */}
                {kawaiiProducts.length > 0 && (
                  <div className="product-grid">
                    {kawaiiProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                      />
                    ))}
                  </div>
                )}

                {!oneScoop &&
                  jewelleryProducts.length === 0 &&
                  kawaiiProducts.length === 0 && (
                    <p>No products available right now.</p>
                  )}
              </>
            )}
          </div>
        </section>

        <BrandExperience />

        <section className="story-section container">
          <div className="story-art">
            <div className="story-sticker">
              made
              <br />
              with <span>♡</span>
            </div>

            <div className="story-flower">✿</div>
            <div className="story-bow">⌁</div>
          </div>

          <div className="story-copy">
            <p className="eyebrow">A little about us</p>

            <h2>A Little About Her Pretty Things</h2>

            <p>
              Her Pretty Things is a tiny corner of the internet filled with
              cute surprises, pretty jewellery, and Kawaii finds. Every piece is
              chosen to add a little sparkle to your day and make gifting feel
              extra lovely.
            </p>

            <Link className="button button-outline" to="/about">
              Know Our Story <ChevronRight size={17} />
            </Link>
          </div>
        </section>

        <SocialGallery />
      </main>
    </>
  );
}

export default Home;