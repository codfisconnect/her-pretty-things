import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { optimizeCloudinaryImage } from "../../utils/cloudinary";

export interface Category {
  id: string;
  number?: string;
  name: string;
  subtitle?: string;
  slug: string;
  description: string;
  ctaText?: string;
  image: string;
  images?: string[];
  rotationInterval?: number;
}

interface CategoryCardProps {
  category: Category;
}

function CategoryCard({ category }: CategoryCardProps) {
  const imageList =
    category.images && category.images.length > 0
      ? category.images
      : [category.image];

  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-rotation every 4.5 - 5.5 seconds with reduced-motion support
  useEffect(() => {
    if (imageList.length <= 1) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) return;

    const intervalTime = category.rotationInterval || 5000;
    const interval = setInterval(() => {
      setCurrentIndex((curr) => (curr + 1) % imageList.length);
    }, intervalTime);

    return () => clearInterval(interval);
  }, [imageList.length, category.rotationInterval]);

  // Preload next image in sequence
  useEffect(() => {
    if (imageList.length > 1) {
      const nextIdx = (currentIndex + 1) % imageList.length;
      const nextUrl = imageList[nextIdx];
      if (nextUrl) {
        const img = new Image();
        img.src = nextUrl;
      }
    }
  }, [currentIndex, imageList]);

  return (
    <Link
      to={`/${category.slug}`}
      className="category-editorial-card"
      aria-label={`${category.name} - ${category.subtitle || category.description}`}
    >
      <div className="category-editorial-media">
        {imageList.map((imgSrc, idx) => {
          const isActive = idx === currentIndex;
          return (
            <img
              key={`${imgSrc}-${idx}`}
              src={optimizeCloudinaryImage(imgSrc, 700)}
              alt={`${category.name} - view ${idx + 1}`}
              className={`category-editorial-img ${isActive ? "active" : ""}`}
              loading={idx === 0 ? "eager" : "lazy"}
              decoding="async"
              onError={(e) => {
                e.currentTarget.style.visibility = "hidden";
              }}
            />
          );
        })}
        <div className="category-editorial-gradient" aria-hidden="true" />
      </div>

      <div className="category-editorial-content">
        <div className="category-editorial-text">
          <h3 className="category-editorial-title">{category.name}</h3>
          <p className="category-editorial-tagline">
            {category.subtitle || category.description}
          </p>
        </div>

        <div className="category-editorial-cta">
          <span className="category-editorial-cta-text">
            {category.ctaText || "Explore"}
          </span>
          <ArrowRight
            size={15}
            className="category-editorial-arrow"
            aria-hidden="true"
          />
        </div>
      </div>
    </Link>
  );
}

export default CategoryCard;


