import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { getProducts } from "../../services/productService";
import { getScoopConfig } from "../../services/scoopService";
import { fetchByobProducts } from "../../services/byobService";
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
  const [scoopImageUrl, setScoopImageUrl] = useState<string | null>(null);
  const [byobPreviewImages, setByobPreviewImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomepageData() {
      try {
        const [jewellery, kawaii, scoopConfig, byobProds] = await Promise.all([
          getProducts("jewellery"),
          getProducts("kawaii"),
          getScoopConfig(),
          fetchByobProducts(),
        ]);
        setJewelleryProducts(jewellery);
        setKawaiiProducts(kawaii);

        if (scoopConfig?.imageUrl) {
          setScoopImageUrl(scoopConfig.imageUrl);
        }

        if (Array.isArray(byobProds) && byobProds.length > 0) {
          const validImages = byobProds
            .filter((p) => p.name && !p.name.toLowerCase().includes("sample"))
            .map((p) => p.image || (p.images && p.images[0]))
            .filter((img): img is string => typeof img === "string" && img.length > 0 && !img.includes("Scoop-Board"));

          if (validImages.length >= 2) {
            setByobPreviewImages(validImages.slice(0, 2));
          } else if (validImages.length === 1) {
            setByobPreviewImages([
              validImages[0],
              "https://res.cloudinary.com/otb2lsot/image/upload/v1790153970/her-pretty-things/products/jljdxbnckvjcxi1fhdwy.png",
            ]);
          } else {
            setByobPreviewImages([
              "https://res.cloudinary.com/otb2lsot/image/upload/v1790154032/her-pretty-things/products/ytmewrjji6wqhvsut5sq.png",
              "https://res.cloudinary.com/otb2lsot/image/upload/v1790315690/her-pretty-things/products/koytyyclbwruvb0in48s.jpg",
            ]);
          }
        } else {
          setByobPreviewImages([
            "https://res.cloudinary.com/otb2lsot/image/upload/v1790154032/her-pretty-things/products/ytmewrjji6wqhvsut5sq.png",
            "https://res.cloudinary.com/otb2lsot/image/upload/v1790315690/her-pretty-things/products/koytyyclbwruvb0in48s.jpg",
          ]);
        }
      } catch (error) {
        console.error("Could not load homepage products:", error);
      } finally {
        setLoading(false);
      }
    }
    loadHomepageData();
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

        {/* Curated Shopping Experiences: Mystery Scoop + Build Your Own Box */}
        <section className="container experiences-section" aria-label="Curated Shopping Experiences">
          <div className="experiences-grid">
            {/* Mystery Scoop Box Card */}
            <article className="experience-card experience-card--scoop">
              <div className="experience-card-content">
                <span className="experience-eyebrow experience-eyebrow--scoop">
                  🍨 OUR SIGNATURE EXPERIENCE
                </span>
                <h2 className="experience-title">The Mystery Scoop Box</h2>
                <p className="experience-tagline">
                  Pick your theme. We&apos;ll curate the magic.
                </p>
                <Link to="/scoops" className="experience-cta experience-cta--scoop">
                  <span>Configure Your Scoop</span>
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </div>

              <div className="experience-card-media experience-card-media--scoop">
                {scoopImageUrl ? (
                  <img
                    src={scoopImageUrl}
                    alt="The Mystery Scoop Box"
                    className="experience-scoop-img"
                    loading="lazy"
                  />
                ) : (
                  <div className="experience-img-skeleton" aria-hidden="true" />
                )}
              </div>
            </article>

            {/* Build Your Own Box Card */}
            <article className="experience-card experience-card--byob">
              <div className="experience-card-content">
                <span className="experience-eyebrow experience-eyebrow--byob">
                  🎁 CUSTOM GIFTING
                </span>
                <h2 className="experience-title">Build Your Own Box</h2>
                <p className="experience-tagline">
                  Your box. Your picks. Your way.
                </p>
                <Link to="/byob" className="experience-cta experience-cta--byob">
                  <span>Start Building Your Box</span>
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </div>

              <div className="experience-card-media experience-card-media--byob">
                <div className="byob-curation-visual">
                  <div className="byob-items-cascade">
                    {byobPreviewImages.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        className={`byob-item-bubble byob-item-bubble--${idx + 1}`}
                      >
                        <img
                          src={imgUrl}
                          alt={`BYOB Pick ${idx + 1}`}
                          loading="lazy"
                        />
                      </div>
                    ))}
                    <div className="byob-gift-target" title="Custom Gift Box">
                      <span>🎁</span>
                      <span className="byob-sparkle-badge">✨</span>
                    </div>
                  </div>
                  <div className="byob-flow-pill">
                    <span>Choose</span>
                    <span className="byob-flow-dot">•</span>
                    <span>Curate</span>
                    <span className="byob-flow-dot">•</span>
                    <span>Gift</span>
                  </div>
                </div>
              </div>
            </article>
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