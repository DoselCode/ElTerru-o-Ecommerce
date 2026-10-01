import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { Product } from '../../types/product';
import type { OrderItem } from '../types';
import { useAdmin } from './AdminContext';
import { useToast } from './ToastContext';

interface CartContextProps {
  cart: OrderItem[];
  addToCart: (prod: Product) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state } = useAdmin();
  const { showToast } = useToast();
  const [cart, setCart] = useState<OrderItem[]>([]);

  const addToCart = useCallback((prod: Product) => {
    const currentStock = state.products.find(p => p.id === prod.id)?.stock ?? 0;
    const alreadyInCart = cart.find(p => p.id === prod.id)?.cartQty ?? 0;
    if (currentStock - alreadyInCart <= 0) {
      showToast('Stock insuficiente para este producto', 'error');
      return;
    }
    setCart(prev => {
      const existing = prev.find(p => p.id === prod.id);
      if (existing) return prev.map(p => p.id === prod.id ? { ...p, cartQty: (p.cartQty || 1) + 1 } : p);
      return [...prev, { ...prod, cartQty: 1 }];
    });
  }, [state.products, cart, showToast]);

  const removeFromCart = useCallback((productId: string) => setCart(prev => prev.filter(p => p.id !== productId)), []);

  const clearCart = useCallback(() => setCart([]), []);

  const value = useMemo(() => ({ cart, addToCart, removeFromCart, clearCart }), [cart, addToCart, removeFromCart, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};