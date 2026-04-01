"use client";
import dynamic from 'next/dynamic';
import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import Filters from '@/components/products/Filters';
import SortDropdown from '@/components/products/SortDropdown';
import ProductGrid from '@/components/products/ProductGrid';
import { useProducts } from '@/context/ProductsContext';
import {
  CheckCircle2, X, Circle, Lightbulb, Wind, Wrench, Cog, CarFront,
  PaintBucket, Filter, Disc3, Shield, Globe
} from 'lucide-react';
import CategoriesBar from '@/components/CategoriesBar';


export default function ProductsPage() {
  const { products } = useProducts();
  
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    brand: '',
    condition: '',
    minPrice: '',
    maxPrice: '',
    minRating: 0,
  });
  
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('popular');
  const [visibleCount, setVisibleCount] = useState(20);
  const [isLoading, setIsLoading] = useState(true);
  const [fitment, setFitment] = useState<{make: string, model: string, year: string} | null>(null);
  const [isVinVerified, setIsVinVerified] = useState(false);
  const [isGlobal, setIsGlobal] = useState(false);

  useEffect(() => {
    // Read URL queries on mount for filtering from categories/vehicles pages
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const m = params.get('make');
      const mo = params.get('model');
      const y = params.get('year');
      const cat = params.get('category');
      const cats = params.get('categories');
      const brand = params.get('brand');
      const s = params.get('search');
      const g = params.get('global');
      const vinV = params.get('vin_verified');
      
      if (m) {
        setFitment({ make: m, model: mo || '', year: y || '' });
        if (vinV === 'true') setIsVinVerified(true);
      }
      
      if (s) setFilters(prev => ({ ...prev, search: s }));
      if (g === 'true') setIsGlobal(true);

      if (m && !s) {
        const match = m.match(/\(([^)]+)\)/);
        const brandName = match ? match[1] : m;
        setFilters(prev => ({ ...prev, brand: brandName }));
      }
      if (cat) {
        setFilters(prev => ({ ...prev, category: cat }));
      }
      if (cats) {
        setSelectedCategories(cats.split(','));
      }
      if (brand) {
        setFilters(prev => ({ ...prev, brand: brand }));
      }
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, [filters, sortBy, isGlobal, selectedCategories]);
  
  const handleLoadMore = () => setVisibleCount(prev => prev + 12);

  const clearFilters = () => {
    setFilters({ search: '', category: '', brand: '', condition: '', minPrice: '', maxPrice: '', minRating: 0 });
    setSelectedCategories([]);
    setIsGlobal(false);
    setIsLoading(true);
  };

  const brands = Array.from(new Set(products.map(p => p.brand).filter(b => b !== 'غير محدد')));
  const categories = Array.from(new Set(products.map(p => p.category).filter(c => c !== 'أخرى')));

  const filteredSortedProducts = useMemo(() => {
    let result = [...products];

    // Multi-category Filter (Exact)
    if (selectedCategories.length > 0) {
      result = result.filter(p => selectedCategories.includes(p.category));
    }

    // Fitment Filter (VIN or Garage car)
    if (fitment?.make) {
      const makeLower = fitment.make.toLowerCase();
      result = result.filter(p => {
        const target = (p.name + ' ' + p.brand + ' ' + (p.description || '')).toLowerCase();
        return target.includes(makeLower);
      });
    }

    // Smart AND Search
    if (filters.search) {
      const searchWords = filters.search.toLowerCase().split(/\s+/).filter(w => w.length > 0);
      result = result.filter(p => {
        const target = (p.name + ' ' + p.brand + ' ' + p.category + ' ' + (p.description || '')).toLowerCase();
        return searchWords.every(word => target.includes(word));
      });
    }

    if (filters.category) result = result.filter(p => p.category === filters.category);
    if (filters.brand) result = result.filter(p => p.brand === filters.brand);
    if (filters.condition) result = result.filter(p => p.condition === filters.condition);
    if (filters.minPrice) result = result.filter(p => p.price >= Number(filters.minPrice));
    if (filters.maxPrice) result = result.filter(p => p.price <= Number(filters.maxPrice));
    if (filters.minRating > 0) result = result.filter(p => p.rating >= filters.minRating);

    if (sortBy === 'price_asc') result.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price_desc') result.sort((a, b) => b.price - a.price);
    else if (sortBy === 'rating') result.sort((a, b) => b.rating - a.rating);
    else if (sortBy === 'popular') result.sort((a, b) => b.reviews - a.reviews);

    return result;
  }, [products, filters, sortBy, fitment, selectedCategories]);

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--background)' }}>
      <Navbar />
      <CategoriesBar />
      
      <div style={{ maxWidth: '1400px', width: '100%', margin: '0 auto', padding: '2.5rem 2rem 5rem', flex: 1 }}>
        
        {/* Fitment & Global Banner */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '3rem' }}>
          {fitment && (
            <div style={{ 
              background: isVinVerified ? 'rgba(37, 99, 235, 0.05)' : 'rgba(16, 185, 129, 0.05)', 
              border: isVinVerified ? '1px solid rgba(37, 99, 235, 0.2)' : '1px solid rgba(16, 185, 129, 0.2)', 
              padding: '1.2rem 2rem', 
              borderRadius: '20px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1.5rem', 
              boxShadow: 'var(--card-shadow)',
              flexWrap: 'wrap'
            }}>
              <div style={{ background: isVinVerified ? '#2563eb' : '#10b981', color: 'white', padding: '0.6rem', borderRadius: '10px', display: 'flex' }}>
                {isVinVerified ? <Shield size={24} /> : <CheckCircle2 size={24} />}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 0.2rem', color: isVinVerified ? '#2563eb' : '#10b981', fontSize: '1.2rem', fontWeight: 900 }}>
                  {isVinVerified ? 'تأكيد VIN نشط' : 'تطابق سيارة الكراج'}
                </h3>
                <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 600 }}>
                  النتائج مخصصة لسيارتك: <span style={{ color: 'var(--primary)', fontWeight: 800 }}>{fitment.make} {fitment.model} {fitment.year}</span>
                </p>
              </div>
            </div>
          )}

          {isGlobal && (
            <div style={{ 
              background: 'rgba(244, 63, 94, 0.05)', 
              border: '1px solid rgba(244, 63, 94, 0.2)', 
              padding: '0.8rem 1.5rem', 
              borderRadius: '16px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem',
              animation: 'pulse 2s infinite'
            }}>
               <Globe size={20} color="var(--primary)" />
               <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '0.9rem' }}>
                 تم تفعيل "البحث العالمي": يتم الآن عرض قطع من الموردين الدوليين والمحليين معاً.
               </span>
            </div>
          )}
        </div>

        {/* Breadcrumb & Header */}
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem', fontWeight: 600 }}>
             الرئيسية <span style={{ margin: '0 0.5rem', opacity: 0.5 }}>/</span> <span style={{ color: 'var(--text-primary)' }}>كل القطع ({filteredSortedProducts.length})</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: 0, color: 'var(--text-primary)' }}>تسوق قطع الغيار</h1>
            
            <div style={{ position: 'relative', width: '100%', maxWidth: '500px' }}>
              <input 
                type="text" 
                placeholder="ابحث عن قطعة، ماركة، أو فئة..." 
                value={filters.search}
                onChange={e => setFilters({...filters, search: e.target.value})}
                style={{ 
                  width: '100%', padding: '1.2rem 1.5rem', background: 'var(--surface)', 
                  border: '1px solid var(--border)', borderRadius: '16px', color: 'var(--text-primary)', fontSize: '1.1rem',
                  outline: 'none', transition: 'all 0.3s ease', boxShadow: 'var(--card-shadow)',
                  fontWeight: 600
                }} 
                onFocus={e => {
                  e.currentTarget.style.borderColor = 'var(--primary)';
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(244, 63, 94, 0.15)';
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.boxShadow = 'var(--card-shadow)';
                }}
              />
            </div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div style={{ display: 'flex', gap: '3rem', alignItems: 'flex-start' }}>
          {/* Sidebar */}
          <div className="sidebar-container" style={{ width: '300px', flexShrink: 0 }}>
             <Filters filters={filters} setFilters={setFilters} clearFilters={clearFilters} brands={brands} categories={categories} />
          </div>

          {/* Grid Area */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <SortDropdown sortBy={sortBy} setSortBy={setSortBy} totalResults={filteredSortedProducts.length} />
            <ProductGrid 
              products={filteredSortedProducts} 
              isLoading={isLoading} 
              visibleCount={visibleCount} 
              onLoadMore={handleLoadMore} 
            />
          </div>
        </div>
      </div>
    </main>
  );
}
