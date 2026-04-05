"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from './AuthContext';

import { Product } from '@/types';
import { ENGINEER_SYSTEMS_PRODUCTS } from '@/lib/engineerData';
import { ACCESSORY_DATA } from '@/lib/accessoryData';
import { getAutoImage, isValidImage } from '@/lib/autoImage';

type ProductsContextType = {
  products: Product[];
  addProduct: (product: Partial<Product> & { name: string; price: number; image?: string }) => Promise<void>;
  isLoading: boolean;
};

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([...ENGINEER_SYSTEMS_PRODUCTS, ...ACCESSORY_DATA]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch from Supabase on mount
  useEffect(() => {
    async function fetchFromSupabase() {
      if (!isSupabaseConfigured) {
        console.warn("No Supabase URL provided. Cannot fetch live data.");
        setIsLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*, profiles(role, business_name, city, phone)')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (data && data.length > 0) {
          // Map DB columns to our precise UI Component schema
          const mapped: Product[] = data.map((d: any) => ({
            id: d.id,
            name: d.name,
            brand: d.brand || 'غير محدد',
            category: d.category || 'أخرى',
            price: Number(d.price),
            oldPrice: d.old_price ? Number(d.old_price) : undefined,
            condition: d.condition || 'جديد',
            stock: d.stock || 'متوفر',
            shipping: d.shipping || 'عادي',
            rating: d.rating || 0,
            reviews: d.reviews_count || 0,
            image: isValidImage(d.image_url) ? d.image_url : getAutoImage(d.category, d.name),
            color: '#' + Math.floor(Math.random()*16777215).toString(16),
            description: d.description || undefined,
            part_number: d.part_number || undefined,
            stock_quantity: d.stock_quantity || 0,
            seller_id: d.seller_id || undefined,
            is_verified_seller: d.profiles?.role === 'seller',
            seller_name: d.profiles?.business_name || undefined,
            seller_latitude: d.seller_latitude || undefined,
            seller_longitude: d.seller_longitude || undefined,
            seller_city: d.seller_city || d.profiles?.city || undefined,
            seller_phone: d.profiles?.phone || undefined,
          }));
          setProducts(mapped);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchFromSupabase();
  }, []);

  const addProduct = async (product: Partial<Product> & { name: string; price: number }) => {
    // Optimistic UI Update placeholder
    const optimisticColor = '#' + Math.floor(Math.random()*16777215).toString(16);
    
    // Prepare Db Record
    const dbRecord = {
      name: product.name,
      brand: product.brand || 'غير محدد',
      category: product.category || 'أخرى',
      price: product.price,
      condition: product.condition || 'جديد',
      stock: product.stock || 'متوفر',
      shipping: product.shipping || 'عادي',
      image_url: isValidImage(product.image) ? product.image : getAutoImage(product.category, product.name),
      is_active: true,
      seller_id: user?.id || null,
      part_number: product.part_number || null,
      description: product.description || null
    };

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('products').insert([dbRecord]).select().single();
      if (!error && data) {
        const newlyAdded: Product = {
          id: data.id,
          name: data.name,
          brand: data.brand || 'غير محدد',
          category: data.category || 'أخرى',
          price: Number(data.price),
          oldPrice: data.old_price ? Number(data.old_price) : undefined,
          condition: data.condition || 'جديد',
          stock: data.stock || 'متوفر',
          shipping: data.shipping || 'عادي',
          image: isValidImage(data.image_url) ? data.image_url : getAutoImage(data.category, data.name),
          rating: 0,
          reviews: 0,
          color: optimisticColor,
          part_number: data.part_number || undefined,
          description: data.description || undefined,
          stock_quantity: data.stock_quantity || 0,
          seller_id: data.seller_id || undefined,
        };
        setProducts(prev => [newlyAdded, ...prev]);
        return;
      }
    }

    // Fallback if no supabase running: push UI state only
    const fallbackAdd: Product = {
      id: Date.now().toString(),
      name: product.name,
      brand: product.brand || 'غير محدد',
      category: product.category || 'أخرى',
      price: product.price,
      condition: product.condition || 'جديد',
      stock: 'متوفر',
      shipping: 'عادي',
      image: isValidImage(product.image) ? product.image! : getAutoImage(product.category || '', product.name),
      rating: 0,
      reviews: 0,
      color: optimisticColor,
      stock_quantity: 10,
      seller_id: product.seller_id || undefined,
    };
    setProducts(prev => [fallbackAdd, ...prev]);
  };

  return (
    <ProductsContext.Provider value={{ products, addProduct, isLoading }}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductsContext);
  if (!context) throw new Error("useProducts must be used within a ProductsProvider");
  return context;
}
