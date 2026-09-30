import React, { createContext, useContext, useState } from 'react';

export type CurrencyCode = 'INR' | 'AED' | 'USD' | 'GBP';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  label: string;
  rate: number; // Conversion rate from base currency (INR)
  position: 'prefix' | 'suffix';
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  INR: {
    code: 'INR',
    symbol: '₹',
    label: 'INR — ₹',
    rate: 1,
    position: 'prefix'
  },
  AED: {
    code: 'AED',
    symbol: 'د.إ',
    label: 'AED — د.إ',
    rate: 0.044,
    position: 'prefix'
  },
  USD: {
    code: 'USD',
    symbol: '$',
    label: 'USD — $',
    rate: 0.012,
    position: 'prefix'
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    label: 'GBP — £',
    rate: 0.0095,
    position: 'prefix'
  }
};

interface CurrencyContextType {
  currency: CurrencyCode;
  config: CurrencyConfig;
  setCurrency: (currency: CurrencyCode) => void;
  formatPrice: (priceInINR: number) => string;
  convertPrice: (priceInINR: number) => number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const STORAGE_KEY = 'yusraa_selected_currency';

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as CurrencyCode;
      if (saved && CURRENCIES[saved]) {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'INR';
  });

  const config = CURRENCIES[currency] || CURRENCIES.INR;

  const setCurrency = (c: CurrencyCode) => {
    if (CURRENCIES[c]) {
      setCurrencyState(c);
      try {
        localStorage.setItem(STORAGE_KEY, c);
      } catch {
        // ignore
      }
    }
  };

  const convertPrice = (priceInINR: number): number => {
    if (config.code === 'INR') return priceInINR;
    const converted = priceInINR * config.rate;
    // Round to 2 decimal places for USD/GBP/AED, or round nicely
    return Math.round(converted * 100) / 100;
  };

  const formatPrice = (priceInINR: number): string => {
    const val = convertPrice(priceInINR);
    if (config.code === 'INR') {
      return `₹${val.toLocaleString('en-IN')}`;
    } else if (config.code === 'AED') {
      return `د.إ ${val.toFixed(2)}`;
    } else if (config.code === 'USD') {
      return `$${val.toFixed(2)}`;
    } else if (config.code === 'GBP') {
      return `£${val.toFixed(2)}`;
    }
    return `₹${priceInINR.toLocaleString('en-IN')}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        config,
        setCurrency,
        formatPrice,
        convertPrice
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
