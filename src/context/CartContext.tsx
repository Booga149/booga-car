"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from '@/context/ToastContext';

export type CartItem = {
  id: string; // Product UUID
  name: string;
  price: number;
  image: string;
  brand: string;
  category?: string;
  quantity: number;
  seller_id?: string;
};

type CartContextType = {
  cartItems: CartItem[];
  addToCart: (product: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  cartCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  cartTotal: number;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('booga_cart');
        if (saved) {
          let items: CartItem[] = JSON.parse(saved);
          let migrated = false;
          // Migrate old fake accessory IDs to real UUIDs
          const OLD_TO_NEW_IDS: Record<string, string> = {
            'acc_01': 'd1a00001-acc0-4000-8000-000000000001',
            'acc_02': 'd1a00002-acc0-4000-8000-000000000002',
            'acc_03': 'd1a00003-acc0-4000-8000-000000000003',
            'acc_04': 'd1a00004-acc0-4000-8000-000000000004',
            'acc_05': 'd1a00005-acc0-4000-8000-000000000005',
            'acc_06': 'd1a00006-acc0-4000-8000-000000000006',
          };
          items = items.map(item => {
            if (OLD_TO_NEW_IDS[item.id]) {
              migrated = true;
              return { ...item, id: OLD_TO_NEW_IDS[item.id] };
            }
            return item;
          });
          if (migrated) {
            localStorage.setItem('booga_cart', JSON.stringify(items));
          }
          return items;
        }
      } catch (e) {
        console.error("Failed to parse cart initial state", e);
      }
    }
    return [];
  });
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(true);
  const { addToast } = useToast();

  // Save to local storage whenever cart changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('booga_cart', JSON.stringify(cartItems));
    }
  }, [cartItems]);

  const addToCart = (product: Omit<CartItem, 'quantity'>) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    
    // Welcome Gift Logic for First-Time Buyers
    if (typeof window !== 'undefined') {
      const hasReceivedDiscount = localStorage.getItem('booga_first_purchase_discount');
      if (!hasReceivedDiscount) {
        localStorage.setItem('booga_first_purchase_discount', 'true');
        setTimeout(() => {
          addToast('هدية أول طلب! 🎁 استخدم كود الخصم SAUDI15 عند الدفع', 'success');
        }, 600);
      }
    }

    // Open cart drawer when adding
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return;
    setCartItems(prev => prev.map(item => 
      item.id === id ? { ...item, quantity } : item
    ));
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const clearCart = () => setCartItems([]);

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      addToCart, 
      removeFromCart, 
      updateQuantity,
      cartCount, 
      isCartOpen, 
      setIsCartOpen, 
      cartTotal,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
}
