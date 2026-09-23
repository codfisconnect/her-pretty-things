import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
    if (!carouselRef.current) {
      return;
    }

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
              cute surprises, pretty jewellery, and Kawaii finds. Every piece
              is chosen to add a little sparkle to your day and make gifting
              feel extra lovely.
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