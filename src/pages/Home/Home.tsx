import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { getProducts } from "../../services/productService";
import CategoryCard, {
  type Category,
} from "../../components/CategoryCard/CategoryCard";
import Hero from "../../components/Hero/Hero";
import ProductCard from "../../components/ProductCard/ProductCard";
import SocialGallery from "../../components/SocialGallery/SocialGallery";
import PrettyPlay from "../../components/PrettyPlay/PrettyPlay";
import type { Product } from "../../types/product";
import "./Home.css";

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
  {
    name: "Build Your Own Box",
    slug: "byob",
    description: "Your box. Your picks. Your custom gift set.",
    accent: "category-pink",
    icon: "🎁",
  },
];

interface ProductCarouselProps {
  title: string;
  products: Product[];
  viewAllPath: string;
}

function ProductCarousel({
  title,
  products,
  viewAllPath,
}: ProductCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollCarousel = (direction: "left" | "right") => {
    if (!carouselRef.current) return;
    const amount = carouselRef.current.clientWidth * 0.8;
    carouselRef.current.scrollBy({
      left: direction === "right" ? amount : -amount,
      behavior: "smooth",
    });
  };

  return (
    <div className="home-product-row">
      <div className="home-product-row-heading">
        <h3>{title}</h3>

        <div className="home-product-row-controls">
          <button
            type="button"
            className="home-carousel-arrow"
            aria-label={`Previous ${title} products`}
            onClick={() => scrollCarousel("left")}
          >
            <ArrowLeft size={16} />
          </button>

          <button
            type="button"
            className="home-carousel-arrow"
            aria-label={`Next ${title} products`}
            onClick={() => scrollCarousel("right")}
          >
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      <div ref={carouselRef} className="home-product-carousel">
        {products.slice(0, 10).map((product) => (
          <div className="home-product-item" key={product.id}>
            <ProductCard product={product} />
          </div>
        ))}

        <Link to={viewAllPath} className="home-see-all-card">
          <span>See All</span>
          <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
}

function Home() {
  const [jewelleryProducts, setJewelleryProducts] = useState<Product[]>([]);
  const [kawaiiProducts, setKawaiiProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        const [jewellery, kawaii] = await Promise.all([
          getProducts("jewellery"),
          getProducts("kawaii"),
        ]);
        setJewelleryProducts(jewellery);
        setKawaiiProducts(kawaii);
      } catch (error) {
        console.error("Could not load homepage products:", error);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  return (
    <>
      <Hero />

      <main>
        {/* 4 Primary Categories */}
        <section className="section container category-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Made to make you smile</p>
              <h2>Shop Your Pretty Picks</h2>
            </div>

            <Link className="text-link desktop-link" to="/jewellery">
              View all <ArrowRight size={16} />
            </Link>
          </div>

          <div className="category-grid">
            {categories.map((category) => (
              <CategoryCard key={category.name} category={category} />
            ))}
          </div>
        </section>

        {/* Handpicked Products Carousel */}
        <section className="section featured-section">
          <div className="container">
            <div className="section-heading">
              <div>
                <p className="eyebrow">
                  <Sparkles size={14} /> Handpicked favourites
                </p>
                <h2>Pretty Picks For You</h2>
              </div>

              <Link className="text-link desktop-link" to="/jewellery">
                Shop everything <ArrowRight size={16} />
              </Link>
            </div>

            {loading ? (
              <div className="home-products-message">
                Loading pretty picks...
              </div>
            ) : (
              <div className="home-product-rows">
                <ProductCarousel
                  title="Jewellery"
                  products={jewelleryProducts}
                  viewAllPath="/jewellery"
                />

                <ProductCarousel
                  title="Kawaii"
                  products={kawaiiProducts}
                  viewAllPath="/kawaii"
                />
              </div>
            )}
          </div>
        </section>

        {/* Mystery Scoop Spotlight Banner */}
        <section className="container" style={{ margin: "2rem auto" }}>
          <div style={{
            background: "linear-gradient(135deg, #fdf2f8 0%, #fff1f2 100%)",
            border: "1.5px solid #fbcfe8",
            borderRadius: 24,
            padding: "2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1.5rem"
          }}>
            <div style={{ maxWidth: 520 }}>
              <span className="eyebrow" style={{ color: "#db2777" }}>
                🍨 OUR SIGNATURE EXPERIENCE
              </span>
              <h2 style={{ fontSize: "1.8rem", margin: "0.3rem 0 0.5rem", color: "#2b2226" }}>
                The Mystery Scoop Box
              </h2>
              <p style={{ color: "#716269", margin: "0 0 1.2rem", lineHeight: 1.5 }}>
                Pick your scoop quantity, choose your favorite colour theme and character, and let us handpick a magical batch of jewellery, keychains, and stationery treasures.
              </p>
              <Link to="/scoops" className="button button-dark">
                Configure Your Scoop <ArrowRight size={16} />
              </Link>
            </div>
            <div style={{ width: 160, height: 160, borderRadius: 20, overflow: "hidden", flexShrink: 0, boxShadow: "0 8px 24px rgba(219,39,119,0.12)" }}>
              <img
                src="/images/Scoop-Board.png"
                alt="Mystery Scoop Board"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          </div>
        </section>

        {/* BYOB Callout Banner */}
        <section className="container" style={{ margin: "2rem auto" }}>
          <div style={{
            background: "linear-gradient(135deg, #faf5f8 0%, #f3e8f0 100%)",
            border: "1.5px solid #ebdbe5",
            borderRadius: 24,
            padding: "2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1.5rem"
          }}>
            <div style={{ maxWidth: 520 }}>
              <span className="eyebrow" style={{ color: "#9d174d" }}>
                🎁 CUSTOM GIFTING
              </span>
              <h2 style={{ fontSize: "1.8rem", margin: "0.3rem 0 0.5rem", color: "#2b2226" }}>
                Build Your Own Box (BYOB)
              </h2>
              <p style={{ color: "#716269", margin: "0 0 1.2rem", lineHeight: 1.5 }}>
                Your box. Your picks. Your way. Choose eligible Kawaii and Jewellery pieces, reach the ₹1,000 minimum, and we will package your personalized hamper with extra sweetness.
              </p>
              <Link to="/byob" className="button button-dark">
                Start Building Your Box <ArrowRight size={16} />
              </Link>
            </div>
            <div style={{ width: 160, height: 160, borderRadius: 20, overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#fdf2f8", fontSize: "3.5rem" }}>
              🎁✨
            </div>
          </div>
        </section>

        {/* Pretty Play Section */}
        <section className="container" style={{ margin: "2.5rem auto" }}>
          <PrettyPlay />
        </section>

        {/* Social / Instagram Gallery */}
        <SocialGallery />
      </main>
    </>
  );
}

export default Home;