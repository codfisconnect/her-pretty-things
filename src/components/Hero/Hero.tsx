import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const heroImages = ["/images/hero-banners/scoops-banner-hero.png"];

function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (heroImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((current) => (current + 1) % heroImages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="hero-section">
      <div className="hero-orbit orbit-one" />
      <div className="hero-orbit orbit-two" />

      <div className="hero-inner container">
        <div className="hero-copy">
          <p className="eyebrow">
            <Sparkles size={14} /> A little lovely, just for you
          </p>

          <h1>
            Find something <em>pretty</em> today.
          </h1>

          <p className="hero-text">
            Curated treasures, sweet surprises, and tiny pieces of joy for your
            everyday.
          </p>

          <div className="hero-actions">
            <Link className="button button-dark" to="/scoops">
              Shop Now <ArrowRight size={17} />
            </Link>

            <Link className="text-link" to="/kawaii">
              Explore Kawaii <ArrowRight size={16} />
            </Link>
          </div>

          <div className="hero-note">
            <span>♥</span> Made for gifting, keeping, and smiling
          </div>
        </div>

        <div className="hero-art">
          <div className="hero-slideshow">
            <img src={heroImages[currentSlide]} alt="Pretty Things Scoops" />
          </div>

          {heroImages.length > 1 && (
            <div className="hero-slide-dots">
              {heroImages.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  className={index === currentSlide ? "active" : ""}
                  onClick={() => setCurrentSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default Hero;
