import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { searchService } from '../../services/searchService';
import { useCurrency } from '../../context/CurrencyContext';
import type { Product } from '../../types/Product';
import './SearchBar.css';

interface SearchBarProps {
  onSelect?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSelect,
  placeholder = 'Search luxury hijabs (Chiffon, Pashmina, Silk...)',
  autoFocus = false,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      const hits = await searchService.searchHijabs({ query });
      setResults(hits);
      setIsOpen(true);
    }, 180);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
      if (onSelect) onSelect();
    }
  };

  const handleItemClick = () => {
    setIsOpen(false);
    setQuery('');
    if (onSelect) onSelect();
  };

  return (
    <div className="search-bar-container" ref={containerRef}>
      <form onSubmit={handleSubmit} role="search" aria-label="Hijab search">
        <div className="search-input-wrapper">
          <Search size={17} className="search-input-icon" aria-hidden="true" />
          <input
            ref={inputRef}
            type="search"
            id="site-search-input"
            className="search-text-input"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (query.trim() && results.length > 0) setIsOpen(true);
            }}
            aria-label="Search hijabs by fabric, colour, or style"
            autoComplete="off"
          />
          {query && (
            <button
              type="button"
              id="clear-search-btn"
              className="search-clear-btn"
              onClick={() => {
                setQuery('');
                setResults([]);
                setIsOpen(false);
                inputRef.current?.focus();
              }}
              aria-label="Clear search input"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </form>

      {isOpen && (
        <div className="search-dropdown-results" role="region" aria-label="Search suggestions">
          {results.length > 0 ? (
            <ul className="search-results-list" role="list">
              {results.slice(0, 5).map((prod) => (
                <li key={prod.id}>
                  <Link
                    to={`/shop/${prod.categorySlug}/${prod.slug}`}
                    className="search-result-item-link"
                    onClick={handleItemClick}
                  >
                    <img
                      src={prod.images[0] || prod.image || '/src/assets/images/yusraa-hero-model.jpg'}
                      alt={`YUSRAA ${prod.name}`}
                      className="search-result-thumb"
                      loading="lazy"
                    />
                    <div className="search-result-meta">
                      <span className="search-result-name">{prod.name}</span>
                      <span className="search-result-fabric">{prod.fabric}</span>
                    </div>
                    <span className="search-result-price">{formatPrice(prod.price)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="search-empty-msg">
              No matching hijabs found for &quot;{query}&quot;
            </div>
          )}
        </div>
      )}
    </div>
  );
};
