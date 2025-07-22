import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

const CartBadge = () => {
  const { getCartCount, getCartTotal } = useCart();
  const cartCount = getCartCount();
  const cartTotal = getCartTotal();

  return (
    <Link
      to="/dashboard/checkout"
      className="relative group flex items-center space-x-2 px-4 py-2 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:bg-zinc-800/50 transition-all duration-300"
    >
      <div className="relative">
        <ShoppingCart className="w-5 h-5 text-zinc-400 group-hover:text-blue-400 transition-colors duration-300" />
        {cartCount > 0 && (
          <div className="absolute -top-2 -right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-white">{cartCount}</span>
          </div>
        )}
      </div>
      
      <div className="flex flex-col">
        <span className="text-xs text-zinc-400 group-hover:text-zinc-300 transition-colors duration-300">
          Cart
        </span>
        <span className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors duration-300">
          ${cartTotal.toFixed(2)}
        </span>
      </div>
    </Link>
  );
};

export default CartBadge; 