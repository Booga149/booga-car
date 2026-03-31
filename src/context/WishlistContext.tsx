"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from './ToastContext';

interface WishlistContextType {
  wishlist: string[]; // List of Product IDs
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<string[]>([]);
  const { addToast } = useToast();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('booga_wishlist');
    if (saved) setWishlist(JSON.parse(saved));
    setMounted(true);
  }, []);

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => {
      const isCurrentlyIn = prev.includes(productId);
      const updated = isCurrentlyIn 
        ? prev.filter(id => id !== productId)
        : [...prev, productId];
      
      localStorage.setItem('booga_wishlist', JSON.stringify(updated));
      
      if (isCurrentlyIn) {
        addToast('تمت إزالة المنتج من المفضلة', 'info');
      } else {
        addToast('تمت إضافة المنتج للمفضلة', 'success');
      }
      
      return updated;
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  // Render provider empty initially for SSR/hydration

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used within WishlistProvider");
  return context;
};
