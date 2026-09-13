import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export interface Category {
  name: string
  slug: string
  description: string
  accent: string
  icon: string
}

interface CategoryCardProps {
  category: Category
}

const categoryImages: Record<string, string> = {
  scoops: '/images/category/scoops-collection.png',
  jewellery: '/images/category/jewellery-collection.png',
  kawaii: '/images/category/kawaii-collection.png',
}

function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      className={`category-card ${category.accent}`}
      to={`/${category.slug}`}
    >
      <div className="category-art">
        <img
          src={categoryImages[category.slug]}
          alt={category.name}
        />
      </div>

      <div className="category-content">
        <p className="category-kicker">
          Collection 0
          {category.name === 'Scoops'
            ? '1'
            : category.name === 'Jewellery'
              ? '2'
              : '3'}
        </p>

        <h3>{category.name}</h3>

        <p>{category.description}</p>

        <span className="category-shop-link">
          Shop Now <ArrowUpRight size={16} />
        </span>
      </div>
    </Link>
  )
}

export default CategoryCard