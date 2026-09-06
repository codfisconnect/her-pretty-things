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

function CategoryCard({ category }: CategoryCardProps) {
  return (
    <article className={`category-card ${category.accent}`}>
      <div className="category-art"><span>{category.icon}</span></div>
      <div className="category-content">
        <p className="category-kicker">Collection 0{category.name === 'Scoops' ? '1' : category.name === 'Jewellery' ? '2' : '3'}</p>
        <h3>{category.name}</h3>
        <p>{category.description}</p>
        <Link className="category-shop-link" to={`/${category.slug}`}>Shop Now <ArrowUpRight size={16} /></Link>
      </div>
    </article>
  )
}

export default CategoryCard
