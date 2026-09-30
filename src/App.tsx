import React, { useEffect } from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { CurrencyProvider } from './context/CurrencyContext';
import { CartProvider } from './context/CartContext';
import { AnnouncementBar } from './components/AnnouncementBar/AnnouncementBar';
import { Header } from './components/Header/Header';
import { QuickCartDrawer } from './components/QuickCartDrawer/QuickCartDrawer';
import { Footer } from './components/Footer/Footer';
import { AppRoutes } from './routes/AppRoutes';
import './App.css';

// Scroll to top on route change
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export const App: React.FC = () => {
  return (
    <CurrencyProvider>
      <CartProvider>
        <BrowserRouter>
          <ScrollToTop />
          <div className="app-shell">
            <AnnouncementBar />
            <Header />
            <main className="site-main" id="main-content">
              <AppRoutes />
            </main>
            <QuickCartDrawer />
            <Footer />
          </div>
        </BrowserRouter>
      </CartProvider>
    </CurrencyProvider>
  );
};

export default App;
