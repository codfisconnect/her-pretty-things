import { ArrowRight, ChevronRight, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import BrandExperience from '../../components/BrandExperience/BrandExperience'
import CategoryCard, { type Category } from '../../components/CategoryCard/CategoryCard'
import Hero from '../../components/Hero/Hero'
import ProductCard from '../../components/ProductCard/ProductCard'
import SocialGallery from '../../components/SocialGallery/SocialGallery'
import type { Product } from '../../types/product'

const categories: Category[] = [
  { name: 'Scoops', slug: 'scoops', description: 'Little surprises waiting to be discovered.', accent: 'category-pink', icon: '🍨' },
  { name: 'Jewellery', slug: 'jewellery', description: 'Pretty pieces for every little moment.', accent: 'category-lilac', icon: '✧' },
  { name: 'Kawaii', slug: 'kawaii', description: "Cute finds you'll want to keep forever.", accent: 'category-yellow', icon: '🐰' },
]

const featuredProducts: Product[] = [
  { id: 1, name: 'Pink Surprise Scoop', category: 'scoops', price: 499, rating: 4.9, image: '/products/pink-scoop.jpg', description: 'A cute surprise scoop filled with pretty little treasures.', stock: 10 },
  { id: 2, name: 'Pearl Bow Necklace', category: 'jewellery', price: 399, rating: 5.0, image: '/products/pearl-bow-necklace.jpg', description: 'A delicate pearl necklace with a pretty bow detail.', stock: 15 },
  { id: 3, name: 'Kawaii Bunny Keychain', category: 'kawaii', price: 249, rating: 4.8, image: '/products/bunny-keychain.jpg', description: 'A cute Kawaii bunny keychain for your everyday bag.', stock: 20 },
  { id: 4, name: 'Cute Heart Bracelet', category: 'jewellery', price: 299, rating: 4.9, image: '/products/heart-bracelet.jpg', description: 'A sweet heart bracelet made for everyday pretty moments.', stock: 12 },
]

function Home() {
  return (
    <>
      <Hero />
      <main>
        <section className="section container category-section">
          <div className="section-heading"><div><p className="eyebrow">Made to make you smile</p><h2>Shop Your Pretty Picks</h2></div><Link className="text-link desktop-link" to="/scoops">View all <ArrowRight size={16} /></Link></div>
          <div className="category-grid">{categories.map((category) => <CategoryCard key={category.name} category={category} />)}</div>
        </section>

        <section className="section featured-section">
          <div className="container"><div className="section-heading"><div><p className="eyebrow"><Sparkles size={14} /> Handpicked favourites</p><h2>Pretty Picks For You</h2></div><Link className="text-link desktop-link" to="/scoops">Shop everything <ArrowRight size={16} /></Link></div><div className="product-grid">{featuredProducts.map((product) => <ProductCard key={product.id} product={product} />)}</div></div>
        </section>

        <BrandExperience />

        <section className="story-section container"><div className="story-art"><div className="story-sticker">made<br />with <span>♡</span></div><div className="story-flower">✿</div><div className="story-bow">⌁</div></div><div className="story-copy"><p className="eyebrow">A little about us</p><h2>A Little About Her Pretty Things</h2><p>Her Pretty Things is a tiny corner of the internet filled with cute surprises, pretty jewellery, and Kawaii finds. Every piece is chosen to add a little sparkle to your day and make gifting feel extra lovely.</p><Link className="button button-outline" to="/about">Know Our Story <ChevronRight size={17} /></Link></div></section>

        <SocialGallery />
      </main>
    </>
  )
}

export default Home
