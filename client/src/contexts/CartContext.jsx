import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [additionalFees, setAdditionalFees] = useState([]);

  const addToCart = (item) => {
    setCart(prev => {
      const existingItem = prev.find(cartItem => 
        cartItem.id === item.id && 
        cartItem.grade === item.grade && 
        cartItem.capacity === item.capacity && 
        cartItem.color === item.color &&
        cartItem.market === item.market
      );
      
      if (existingItem) {
        return prev.map(cartItem =>
          cartItem.id === item.id && 
          cartItem.grade === item.grade && 
          cartItem.capacity === item.capacity && 
          cartItem.color === item.color &&
          cartItem.market === item.market
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId, grade, capacity, color, market) => {
    setCart(prev => prev.filter(item => 
      !(item.id === itemId && 
        item.grade === grade && 
        item.capacity === capacity && 
        item.color === color &&
        item.market === market)
    ));
  };

  const updateQuantity = (itemId, grade, capacity, color, market, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId, grade, capacity, color, market);
      return;
    }
    
    setCart(prev =>
      prev.map(item =>
        item.id === itemId && 
        item.grade === grade && 
        item.capacity === capacity && 
        item.color === color &&
        item.market === market
          ? { ...item, quantity }
          : item
      )
    );
  };

  const getCartCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getCartSubtotal = () => {
    return cart.reduce((total, item) => {
      const price = item.finalPrice || item.customerPrice || item.sellPrice || 0;
      return total + (price * item.quantity);
    }, 0);
  };

  const getFeesTotal = () => {
    return additionalFees.reduce((total, fee) => total + fee.amount, 0);
  };

  const getCartTotal = () => {
    return getCartSubtotal() + getFeesTotal();
  };

  const clearCart = () => {
    setCart([]);
    setSelectedCustomer(null);
    setAdditionalFees([]);
  };

  const addFee = (label, amount) => {
    const newFee = {
      id: Date.now(),
      label,
      amount: parseFloat(amount)
    };
    setAdditionalFees(prev => [...prev, newFee]);
  };

  const removeFee = (feeId) => {
    setAdditionalFees(prev => prev.filter(fee => fee.id !== feeId));
  };

  const updateFee = (feeId, label, amount) => {
    setAdditionalFees(prev => 
      prev.map(fee => 
        fee.id === feeId 
          ? { ...fee, label, amount: parseFloat(amount) }
          : fee
      )
    );
  };

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    getCartCount,
    getCartSubtotal,
    getCartTotal,
    clearCart,
    isCartOpen,
    setIsCartOpen,
    selectedCustomer,
    setSelectedCustomer,
    additionalFees,
    addFee,
    removeFee,
    updateFee,
    getFeesTotal,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}; 