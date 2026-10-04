import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import type { HeroSlide } from "../../utils/productSlides";
import { optimizeCloudinaryImage } from "../../utils/cloudinary";



interface HeroProps {
  slides?: HeroSlide[];
}

function Hero({ slides }: HeroProps) {
  const activeSlides = useMemo(() => {
    return slides && slides.length > 0 ? slides : [];
  }, [slides]);

  const [currentSlide, setCurrentSlide] = useState(0);

  // Keep index valid if slides array updates dynamically
  useEffect(() => {
    if (currentSlide >= activeSlides.length) {
      setCurrentSlide(0);
    }
  }, [activeSlides.length, currentSlide]);

  // Auto-rotation every 5 seconds with reduced-motion support
  useEffect(() => {
    if (activeSlides.length <= 1) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) return;

    const interval = setInterval(() => {
      setCurrentSlide((curr) => (curr + 1) % activeSlides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [activeSlides.length]);

  // Preload next slide image
  useEffect(() => {
    if (activeSlides.length > 1) {
      const nextIndex = (currentSlide + 1) % activeSlides.length;
      const nextSlide = activeSlides[nextIndex];
      if (nextSlide?.url) {
        const img = new Image();
        const targetWidth = typeof window !== "undefined" && window.innerWidth <= 650 ? 750 : 900;
        img.src = optimizeCloudinaryImage(nextSlide.url, targetWidth);
      }
    }
  }, [currentSlide, activeSlides]);

  const current = activeSlides[currentSlide] || activeSlides[0];

  // Contextual Primary CTA and dynamic badge derived from active slide category
  const contextualCta = useMemo(() => {
    switch (current?.category) {
      case "scoops":
        return {
          text: "SHOP SCOOPS",
          path: "/scoops",
          badge: "MYSTERY SCOOP",
        };
      case "jewellery":
        return {
          text: "SHOP JEWELLERY",
          path: "/jewellery",
          badge: "JEWELLERY",
        };
      case "kawaii":
        return {
          text: "SHOP KAWAII",
          path: "/kawaii",
          badge: "KAWAII",
        };
      default:
        return {
          text: "SHOP THE COLLECTION",
          path: "/jewellery",
          badge: "FEATURED",
        };
    }
  }, [current?.category]);

  if (!current) {
    return null;
  }
  return (
    <section className="hero-section" aria-label="Featured Collection Hero">
      <div className="hero-container">
        <div className="hero-grid">
          <div className="hero-copy">
            {/* Header Block */}
            <div className="hero-header-block">
              <p className="hero-eyebrow">
                <Sparkles size={14} aria-hidden="true" />
                <span>A LITTLE LOVELY, JUST FOR YOU</span>
              </p>

              <h1 className="hero-title">
                Find something <span className="hero-pretty">pretty</span> today.
              </h1>
            </div>

            {/* Details & Actions Block */}
            <div className="hero-details-block">
              <p className="hero-text">
                Curated treasures, sweet surprises, and tiny pieces of joy for
                your everyday.
              </p>

              <div className="hero-actions">
                <Link
                  className="button button-dark hero-btn-primary"
                  to={contextualCta.path}
                  aria-label={`${contextualCta.text} - Explore ${contextualCta.badge}`}
                >
                  <span>{contextualCta.text}</span>
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>

                <Link
                  className="button button-outline hero-btn-secondary"
                  to="/byob"
                >
                  <span>BUILD YOUR OWN BOX</span>
                </Link>
              </div>

              <div className="hero-note">
                <span className="hero-heart" aria-hidden="true">
                  ♥
                </span>
                <span>Made for gifting, keeping, and smiling</span>
              </div>
            </div>
          </div>

          {/* Slideshow Art */}
          <div className="hero-art">
            <div
              className="hero-slideshow"
              role="region"
              aria-roledescription="carousel"
              aria-label="Dynamic Product Showcase"
            >
              {activeSlides.map((slide, index) => {
                const isActive = index === currentSlide;
                return (
                  <div
                    key={`${slide.url}-${index}`}
                    className={`hero-slide-item hero-slide-item--${slide.category} ${isActive ? "active" : ""}`}
                    aria-hidden={!isActive}
                  >
                    <img
                      src={isActive ? optimizeCloudinaryImage(slide.url, 950) : undefined}
                      srcSet={
                        isActive && slide.url.includes("res.cloudinary.com")
                          ? `${optimizeCloudinaryImage(slide.url, 750)} 750w, ${optimizeCloudinaryImage(slide.url, 950)} 950w`
                          : undefined
                      }
                      sizes="(max-width: 650px) 100vw, (max-width: 1024px) 50vw, 650px"
                      alt={isActive ? (slide.alt || "Her Pretty Things featured product") : ""}
                      className="hero-slide-img"
                      loading={isActive ? "eager" : undefined}
                      decoding="async"
                      fetchPriority={isActive ? "high" : "auto"}
                      onError={(e) => {
                        e.currentTarget.style.visibility = "hidden";
                      }}
                    />
                  </div>
                );
              })}

              {/* Luminous overlay for mobile text readability */}
              <div className="hero-slide-overlay" aria-hidden="true" />

              {/* Dynamic Category Badge in top right */}
              <div className="hero-slide-badge" aria-live="polite">
                {contextualCta.badge}
              </div>

              {/* Slideshow Indicator Dots */}
              {activeSlides.length > 1 && (
                <div
                  className="hero-slide-dots"
                  role="tablist"
                  aria-label="Slideshow pagination"
                >
                  {activeSlides.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      role="tab"
                      aria-selected={index === currentSlide}
                      className={`hero-dot ${index === currentSlide ? "active" : ""}`}
                      onClick={() => setCurrentSlide(index)}
                      aria-label={`Go to slide ${index + 1}: ${activeSlides[index]?.category || "featured"}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
