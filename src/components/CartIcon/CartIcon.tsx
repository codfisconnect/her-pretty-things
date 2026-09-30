import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import './CartIcon.css';

interface CartIconProps {
  onClick?: () => void;
  id?: string;
}

export const CartIcon: React.FC<CartIconProps> = ({ onClick, id = 'cart-icon-btn' }) => {
  const { totalItems, openCartDrawer } = useCart();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      openCartDrawer();
    }
  };

  return (
    <button
      type="button"
      id={id}
      className="cart-icon-btn"
      onClick={handleClick}
      aria-label={`Shopping Cart with ${totalItems} items`}
    >
      <ShoppingBag size={20} aria-hidden="true" />
      {totalItems > 0 && (
        <span className="cart-badge" aria-hidden="true">
          {totalItems > 99 ? '99+' : totalItems}
        </span>
      )}
    </button>
  );
};
