import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
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
  const imageList = useMemo(() => {
    return category.images && category.images.length > 0
      ? category.images.filter((img) => typeof img === "string" && img.trim().length > 0)
      : category.image && category.image.trim().length > 0
      ? [category.image]
      : [];
  }, [category.images, category.image]);

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

  // Preload next image in sequence if rotating
  useEffect(() => {
    if (imageList.length > 1) {
      const nextIdx = (currentIndex + 1) % imageList.length;
      const nextUrl = imageList[nextIdx];
      if (nextUrl) {
        const img = new Image();
        img.src = optimizeCloudinaryImage(nextUrl, 700);
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
          const finalSrc = optimizeCloudinaryImage(imgSrc, 700);
          if (!finalSrc) return null;

          return (
            <img
              key={`${imgSrc}-${idx}`}
              src={finalSrc}
              alt={`${category.name} collection`}
              className={`category-editorial-img ${isActive ? "active" : ""}`}
              loading="lazy"
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
