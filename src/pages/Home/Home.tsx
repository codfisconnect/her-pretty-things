import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
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
import { homepageAssets } from "../../constants/homepageAssets";
import "./Home.css";

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

// Curated static promotional category cards - renders immediately with zero network delay
const staticCategories: Category[] = [
  {
    id: "scoops",
    number: "01",
    name: "MYSTERY SCOOP",
    subtitle: "Pick your surprise",
    slug: "scoops",
    description: "Pick your surprise",
    ctaText: "Explore",
    image: homepageAssets.scoop,
    images: [homepageAssets.scoop],
  },
  {
    id: "jewellery",
    number: "02",
    name: "JEWELLERY",
    subtitle: "Find your little sparkle",
    slug: "jewellery",
    description: "Find your little sparkle",
    ctaText: "Explore",
    image: homepageAssets.jewellery,
    images: [homepageAssets.jewellery],
  },
  {
    id: "kawaii",
    number: "03",
    name: "KAWAII",
    subtitle: "Something cute awaits",
    slug: "kawaii",
    description: "Something cute awaits",
    ctaText: "Explore",
    image: homepageAssets.kawaii,
    images: [homepageAssets.kawaii],
  },
  {
    id: "byob",
    number: "04",
    name: "BUILD YOUR OWN BOX",
    subtitle: "Create yours",
    slug: "byob",
    description: "Create yours",
    ctaText: "Explore",
    image: homepageAssets.byob,
    images: [homepageAssets.byob],
  },
];

function Home() {
  const [jewelleryProducts, setJewelleryProducts] = useState<Product[]>([]);
  const [kawaiiProducts, setKawaiiProducts] = useState<Product[]>([]);

  // Independent below-the-fold dynamic product catalog loading (non-blocking for Hero & Categories)
  useEffect(() => {
    let isMounted = true;
    async function loadProducts() {
      try {
        const [jewellery, kawaii] = await Promise.all([
          getProducts("jewellery"),
          getProducts("kawaii"),
        ]);

        if (isMounted) {
          setJewelleryProducts(jewellery);
          setKawaiiProducts(kawaii);
        }
      } catch (error) {
        console.error("Could not load homepage products:", error);
      }
    }

    loadProducts();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      <Hero />

      <main>
        {/* Unified Premium Editorial Category Showcase */}
        <section className="section category-showcase-section" aria-label="Shop The Collection">
          <div className="category-showcase-container">
            <div className="category-showcase-header">
              <p className="category-showcase-eyebrow">SHOP THE COLLECTION</p>
              <h2 className="category-showcase-heading">Find Your Pretty Thing</h2>
              <p className="category-showcase-supporting">
                Something sweet, something sparkly, something completely you.
              </p>
            </div>

            <div className="category-showcase-grid">
              {staticCategories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
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
