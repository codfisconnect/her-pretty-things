import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Globe } from 'lucide-react';
import { useCurrency, CURRENCIES, type CurrencyCode } from '../../context/CurrencyContext';
import './CurrencySelector.css';

export const CurrencySelector: React.FC = () => {
  const { currency, setCurrency } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const codes = Object.keys(CURRENCIES) as CurrencyCode[];

  return (
    <div className="currency-selector-wrapper" ref={containerRef}>
      <button
        type="button"
        id="currency-selector-btn"
        className="currency-trigger-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={`Select currency, current is ${currency}`}
      >
        <Globe size={13} className="currency-globe-icon" aria-hidden="true" />
        <span className="currency-symbol-tag">{CURRENCIES[currency].symbol}</span>
        <span className="currency-current-code">{currency}</span>
        <ChevronDown size={13} className={`currency-chevron ${isOpen ? 'open' : ''}`} aria-hidden="true" />
      </button>

      {isOpen && (
        <div className="currency-dropdown-menu" role="listbox" aria-label="Available currencies">
          {codes.map((code) => {
            const item = CURRENCIES[code];
            const isSelected = code === currency;
            return (
              <button
                key={code}
                type="button"
                id={`currency-opt-${code.toLowerCase()}`}
                role="option"
                aria-selected={isSelected}
                className={`currency-option-item ${isSelected ? 'active' : ''}`}
                onClick={() => {
                  setCurrency(code);
                  setIsOpen(false);
                }}
              >
                <span className="currency-code-text">{code}</span>
                <span className="currency-sym-text">{item.symbol}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
