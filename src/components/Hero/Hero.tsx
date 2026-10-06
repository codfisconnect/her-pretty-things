import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { homepageAssets } from "../../constants/homepageAssets";

interface HeroProps {
  desktopSrc?: string;
  mobileSrc?: string;
}

function Hero({
  desktopSrc = homepageAssets.heroDesktop,
  mobileSrc = homepageAssets.heroMobile,
}: HeroProps) {
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
                  to="/jewellery"
                  aria-label="Shop The Collection - Explore Jewellery"
                >
                  <span>SHOP THE COLLECTION</span>
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

          {/* Static Optimized Hero Visual with responsive <picture> */}
          <div className="hero-art">
            <div className="hero-visual-frame">
              <picture className="hero-picture">
                <source
                  media="(max-width: 650px)"
                  srcSet={mobileSrc}
                  type="image/webp"
                />
                <img
                  src={desktopSrc}
                  alt="Her Pretty Things curated gift box collection with sparkling jewellery and kawaii treasures"
                  className="hero-static-img"
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                  onError={(e) => {
                    e.currentTarget.style.visibility = "hidden";
                  }}
                />
              </picture>

              {/* Luminous overlay for mobile text readability */}
              <div className="hero-slide-overlay" aria-hidden="true" />

              {/* Curated Editorial Badge */}
              <div className="hero-slide-badge" aria-label="Featured Collection">
                CURATED GIFTS
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
