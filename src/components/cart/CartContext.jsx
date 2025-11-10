import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('arancini-cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('arancini-cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (meal) => {
    setCartItems(prev => {
      const existingIndex = prev.findIndex(item => item.id === meal.id);
      if (existingIndex > -1) {
        return prev.map((item, index) => 
          index === existingIndex 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...meal, quantity: 1 }];
    });
  };

  const removeFromCart = (mealId) => {
    setCartItems(prev => prev.filter(item => item.id !== mealId));
  };

  const updateQuantity = (mealId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(mealId);
      return;
    }
    setCartItems(prev => 
      prev.map(item => 
        item.id === mealId 
          ? { ...item, quantity }
          : item
      )
    );
  };

  const addMultipleToCart = (meals) => {
    setCartItems(prev => {
      const newCart = [...prev];
      meals.forEach(meal => {
        const existingIndex = newCart.findIndex(item => item.id === meal.id);
        if (existingIndex > -1) {
          newCart[existingIndex] = {
            ...newCart[existingIndex],
            quantity: newCart[existingIndex].quantity + 1,
          };
        } else {
          newCart.push({ ...meal, quantity: 1 });
        }
      });
      return newCart;
    });
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    addMultipleToCart,
    clearCart,
    getTotalItems,
    getTotalPrice,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};