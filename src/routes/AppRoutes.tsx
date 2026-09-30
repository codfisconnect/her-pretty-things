import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Pages
import { Home } from '../pages/Home/Home';
import { Shop } from '../pages/Shop/Shop';
import { Collection } from '../pages/Collection/Collection';
import { PremiumCollection } from '../pages/PremiumCollection/PremiumCollection';
import { CompleteAtelier } from '../pages/CompleteAtelier/CompleteAtelier';
import { ProductDetails } from '../pages/ProductDetails/ProductDetails';
import { Cart } from '../pages/Cart/Cart';
import { Checkout } from '../pages/Checkout/Checkout';
import { About } from '../pages/About/About';
import { FAQ } from '../pages/FAQ/FAQ';
import { Contact } from '../pages/Contact/Contact';
import { PrivacyPolicy } from '../pages/PrivacyPolicy/PrivacyPolicy';
import { Terms } from '../pages/Terms/Terms';
import { ShippingPolicy } from '../pages/ShippingPolicy/ShippingPolicy';
import { RefundPolicy } from '../pages/RefundPolicy/RefundPolicy';
import { NotFound } from '../pages/NotFound/NotFound';
import { AdminDashboard } from '../admin/AdminDashboard/AdminDashboard';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* 1. Home */}
      <Route path="/" element={<Home />} />

      {/* 2. Shop & Product Details */}
      <Route path="/shop" element={<Shop />} />
      <Route path="/shop/" element={<Shop />} />
      <Route path="/shop/:category/:slug" element={<ProductDetails />} />
      <Route path="/shop/:category/:slug/" element={<ProductDetails />} />
      <Route path="/product/:id" element={<ProductDetails />} />

      {/* 3. Complete Atelier */}
      <Route path="/complete-atelier" element={<CompleteAtelier />} />
      <Route path="/complete-atelier/" element={<CompleteAtelier />} />
      <Route path="/atelier" element={<Navigate to="/complete-atelier" replace />} />
      <Route path="/atelier/" element={<Navigate to="/complete-atelier" replace />} />

      {/* 4. Collections */}
      <Route path="/collection" element={<Collection />} />
      <Route path="/collection/" element={<Collection />} />
      <Route path="/collections" element={<Navigate to="/collection" replace />} />
      <Route path="/collections/" element={<Navigate to="/collection" replace />} />
      <Route path="/collection/premium" element={<Navigate to="/premium-hijab-collection" replace />} />
      <Route path="/collection/premium/" element={<Navigate to="/premium-hijab-collection" replace />} />
      <Route path="/premium-hijab-collection" element={<PremiumCollection />} />
      <Route path="/premium-hijab-collection/" element={<PremiumCollection />} />

      {/* 4. Fabric-Specific Taxonomy Shortcuts */}
      <Route path="/chiffon-hijab" element={<Shop />} />
      <Route path="/chiffon-hijab/" element={<Shop />} />
      <Route path="/pashmina-hijab" element={<Shop />} />
      <Route path="/pashmina-hijab/" element={<Shop />} />
      <Route path="/silk-hijab" element={<Shop />} />
      <Route path="/silk-hijab/" element={<Shop />} />
      <Route path="/modal-hijab" element={<Shop />} />
      <Route path="/modal-hijab/" element={<Shop />} />
      <Route path="/jersey-hijab" element={<Shop />} />
      <Route path="/jersey-hijab/" element={<Shop />} />
      <Route path="/cotton-hijab" element={<Shop />} />
      <Route path="/cotton-hijab/" element={<Shop />} />
      <Route path="/product-category/:category" element={<Shop />} />
      <Route path="/product-category/:category/" element={<Shop />} />

      {/* 5. Cart & Checkout */}
      <Route path="/cart" element={<Cart />} />
      <Route path="/cart/" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/checkout/" element={<Checkout />} />

      {/* 6. Company & Support */}
      <Route path="/about" element={<About />} />
      <Route path="/about/" element={<About />} />
      <Route path="/about-us" element={<About />} />
      <Route path="/about-us/" element={<About />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/faq/" element={<FAQ />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/contact/" element={<Contact />} />
      <Route path="/contact-us" element={<Contact />} />
      <Route path="/contact-us/" element={<Contact />} />

      {/* 7. Legal Policies (No 404s) */}
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/privacy-policy/" element={<PrivacyPolicy />} />
      <Route path="/privacy-policy-2" element={<Navigate to="/privacy-policy" replace />} />
      <Route path="/privacy-policy-2/" element={<Navigate to="/privacy-policy" replace />} />
      <Route path="/privacy" element={<Navigate to="/privacy-policy" replace />} />
      <Route path="/privacy/" element={<Navigate to="/privacy-policy" replace />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/terms/" element={<Terms />} />
      <Route path="/terms-and-conditions" element={<Terms />} />
      <Route path="/terms-and-conditions/" element={<Terms />} />
      <Route path="/shipping-policy" element={<ShippingPolicy />} />
      <Route path="/shipping-policy/" element={<ShippingPolicy />} />
      <Route path="/shipping" element={<Navigate to="/shipping-policy" replace />} />
      <Route path="/shipping/" element={<Navigate to="/shipping-policy" replace />} />
      <Route path="/refund-policy" element={<RefundPolicy />} />
      <Route path="/refund-policy/" element={<RefundPolicy />} />
      <Route path="/refund" element={<Navigate to="/refund-policy" replace />} />
      <Route path="/refund/" element={<Navigate to="/refund-policy" replace />} />

      {/* 8. Admin Portal */}
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/" element={<AdminDashboard />} />

      {/* 9. Legacy /deme/ redirect */}
      <Route path="/deme" element={<Navigate to="/" replace />} />
      <Route path="/deme/" element={<Navigate to="/" replace />} />

      {/* 10. Catch-All 404 */}
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
