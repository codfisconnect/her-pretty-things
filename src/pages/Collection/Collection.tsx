import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import './Collection.css';

interface CuratedCollection {
  id: string;
  name: string;
  slug: string;
  tag: string;
  description: string;
  image: string;
  link: string;
}

const collections: CuratedCollection[] = [
  {
    id: 'jersey-coll',
    name: 'Jersey Hijab',
    slug: 'jersey-hijab',
    tag: 'Everyday Ease',
    description: 'Effortless pin-free 4-way stretch comfort crafted from premium combed Egyptian cotton.',
    image: '/src/assets/images/yusraa-jersey-hijab.jpg',
    link: '/shop?category=jersey-hijab'
  },
  {
    id: 'chiffon-coll',
    name: 'Chiffon Hijab',
    slug: 'chiffon-hijab',
    tag: 'Featherlight Grace',
    description: 'Featherlight Malaysian high-density georgette chiffon with subtle crepe grain and fluid drape.',
    image: '/src/assets/images/yusraa-chiffon-hijab.jpg',
    link: '/shop?category=chiffon-hijab'
  },
  {
    id: 'organza-coll',
    name: 'Organza Hijab',
    slug: 'organza-hijab',
    tag: 'Luminous Shimmer',
    description: 'Ethereal metallic shimmer weaves designed to capture ambient light for celebratory moments.',
    image: '/src/assets/images/yusraa-organza-hijab.jpg',
    link: '/shop?category=organza-hijab'
  },
  {
    id: 'pashmina-coll',
    name: 'Pashmina Hijab',
    slug: 'pashmina-hijab',
    tag: 'Winter Opulence',
    description: 'Handcrafted cashmere-touch pashmina fibres offering plush thermal warmth and regal elegance.',
    image: '/src/assets/images/yusraa-pashmina-hijab.jpg',
    link: '/shop?category=pashmina-hijab'
  },
  {
    id: 'modal-coll',
    name: 'Modal Hijab',
    slug: 'modal-hijab',
    tag: 'Cloud Comfort',
    description: 'Sustainable Lenzing modal with a buttery liquid drape, thermoregulation, and non-slip hold.',
    image: '/src/assets/images/yusraa-modal-hijab.jpg',
    link: '/shop?category=modal-hijab'
  },
  {
    id: 'silk-coll',
    name: 'Silk Hijab',
    slug: 'silk-hijab',
    tag: 'Haute Glamour',
    description: 'Grade 6A Mulberry silk satin with lustrous outer glow and hair-protective non-slip reverse.',
    image: '/src/assets/images/yusraa-silk-hijab.jpg',
    link: '/shop?category=silk-hijab'
  },
  {
    id: 'cotton-coll',
    name: 'Cotton Hijab',
    slug: 'cotton-hijab',
    tag: 'Pure Breathability',
    description: 'Organic combed cotton voile delivering all-day breathability, absorbency, and zero slip.',
    image: '/src/assets/images/yusraa-cotton-hijab.jpg',
    link: '/shop?category=cotton-hijab'
  },
  {
    id: 'satin-coll',
    name: 'Satin Hijab',
    slug: 'satin-hijab',
    tag: 'Liquid Radiance',
    description: 'Luminous liquid satin with an innovative textured matte reverse that stays firmly pinned.',
    image: '/src/assets/images/yusraa-satin-hijab.jpg',
    link: '/shop?category=satin-hijab'
  },
  {
    id: 'pearlmist-coll',
    name: 'Pearlmist Hijab',
    slug: 'pearlmist-hijab',
    tag: 'Subtle Iridescence',
    description: 'Subtle pearlescent micro-filaments reflecting a soft, angelic glow for formal galas.',
    image: '/src/assets/images/yusraa-pearlmist-hijab.jpg',
    link: '/shop?category=pearlmist-hijab'
  },
  {
    id: 'printed-coll',
    name: 'Printed Hijab',
    slug: 'printed-hijabs',
    tag: 'Artisanal Florals',
    description: 'Curated Persian botanical and marble prints with reactive dyes on lightweight georgette.',
    image: '/src/assets/images/yusraa-printed-hijab.jpg',
    link: '/shop?category=printed-hijabs'
  },
  {
    id: 'premium-coll',
    name: 'Premium Hijab Collection',
    slug: 'premium-hijab-collection',
    tag: 'Festive Milestones',
    description: 'Our ultra-exclusive capsule line combining pure mulberry silks, artisanal pashminas, and pearls.',
    image: '/src/assets/images/yusraa-premium-collection.jpg',
    link: '/premium-hijab-collection'
  }
];

export const Collection: React.FC = () => {
  return (
    <div className="collection-page">
      <div className="collection-header">
        <h1 className="collection-header-title">Curated Hijab Collections</h1>
        <p className="collection-header-sub">
          Each Yusraa collection is curated around specific fiber compositions, textures,
          and moments in a modest woman&apos;s life.
        </p>
      </div>

      <div className="collection-cards-grid">
        {collections.map((c) => (
          <Link
            key={c.id}
            to={c.link}
            className="collection-feature-card"
            id={`collection-card-${c.id}`}
          >
            <img src={c.image} alt={`Yusraa ${c.name}`} className="collection-card-img" />
            <div className="collection-card-overlay" />
            <div className="collection-card-info">
              <span className="collection-card-tag">
                <Sparkles size={11} style={{ display: 'inline', marginRight: 4 }} />
                {c.tag}
              </span>
              <h2 className="collection-card-name">{c.name}</h2>
              <p className="collection-card-desc">{c.description}</p>
              <span className="collection-card-cta">
                <span>Explore Collection</span>
                <ArrowRight size={15} />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
