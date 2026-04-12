"use client"; // force reload
import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import Filters from '@/components/products/Filters';
import SortDropdown from '@/components/products/SortDropdown';
import ProductGrid from '@/components/products/ProductGrid';
import { useProducts } from '@/context/ProductsContext';
import {
  CheckCircle2, X, Circle, Lightbulb, Wind, Wrench, Cog, CarFront,
  PaintBucket, Filter, Disc3, Shield, Globe, MapPin, Locate, SlidersHorizontal
} from 'lucide-react';
import CategoriesBar from '@/components/CategoriesBar';
import { useGeolocation, calculateDistance } from '@/hooks/useGeolocation';


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
  const [multiSearch, setMultiSearch] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('popular');
  const [visibleCount, setVisibleCount] = useState(20);
  const [isLoading, setIsLoading] = useState(true);
  const [fitment, setFitment] = useState<{make: string, model: string, year: string} | null>(null);
  const [isVinVerified, setIsVinVerified] = useState(false);
  const [isGlobal, setIsGlobal] = useState(false);
  const [distanceRange, setDistanceRange] = useState<number>(0); // 0 = كل المسافات
  const { position, requestLocation, isLoading: geoLoading, permissionState } = useGeolocation(true);

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
      const ms = params.get('multi_search');
      const g = params.get('global');
      const vinV = params.get('vin_verified');
      
      if (m) {
        setFitment({ make: m, model: mo || '', year: y || '' });
        if (vinV === 'true') setIsVinVerified(true);
      }
      
      if (s) setFilters(prev => ({ ...prev, search: s }));
      if (ms) setMultiSearch(ms.split(',').map(w => w.trim()).filter(w => w.length > 0));
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
    setMultiSearch([]);
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

    // Multi-keyword OR Search (from EngineeringSystems)
    if (multiSearch.length > 0) {
      result = result.filter(p => {
        const target = (p.name + ' ' + p.brand + ' ' + p.category + ' ' + (p.description || '')).toLowerCase();
        return multiSearch.some(word => target.includes(word.toLowerCase()));
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

    // حساب المسافة وإضافتها لكل منتج
    if (position) {
      result = result.map(p => {
        if (p.seller_latitude && p.seller_longitude) {
          return {
            ...p,
            seller_distance: calculateDistance(
              position.latitude, position.longitude,
              p.seller_latitude, p.seller_longitude
            )
          };
        }
        return p;
      });

      // فلتر المسافة
      if (distanceRange > 0) {
        result = result.filter(p => p.seller_distance !== undefined && p.seller_distance <= distanceRange);
      }

      // ترتيب حسب الأقرب
      if (sortBy === 'nearest') {
        result.sort((a, b) => (a.seller_distance ?? 9999) - (b.seller_distance ?? 9999));
      }
    }

    return result;
  }, [products, filters, sortBy, fitment, selectedCategories, multiSearch, position, distanceRange]);

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--background)' }}>
      <Navbar />
      <CategoriesBar />
      
      <div className="products-page-container" style={{ maxWidth: '1400px', width: '100%', margin: '0 auto', padding: '1.5rem 2rem 5rem', flex: 1 }}>
        
        {/* Fitment & Global Banner */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
          {fitment && (
            <div style={{ 
              background: isVinVerified ? 'rgba(37, 99, 235, 0.12)' : 'rgba(16, 185, 129, 0.12)', 
              border: isVinVerified ? '1.5px solid rgba(37, 99, 235, 0.3)' : '1.5px solid rgba(16, 185, 129, 0.3)', 
              padding: '1rem 1.8rem', 
              borderRadius: '16px',
              display: 'flex', 
              alignItems: 'center', 
              gap: '1.2rem', 
              boxShadow: '0 4px 15px rgba(0,0,0,0.06)',
              flexWrap: 'wrap',
            }}>
              <div style={{ 
                background: isVinVerified ? '#2563eb' : '#10b981', 
                color: 'white', 
                padding: '0.6rem', 
                borderRadius: '12px', 
                display: 'flex',
                boxShadow: isVinVerified ? '0 4px 12px rgba(37,99,235,0.3)' : '0 4px 12px rgba(16,185,129,0.3)',
              }}>
                {isVinVerified ? <Shield size={22} /> : <CheckCircle2 size={22} />}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 0.15rem', color: isVinVerified ? '#2563eb' : '#059669', fontSize: '1.05rem', fontWeight: 900 }}>
                  {isVinVerified ? 'تأكيد VIN نشط' : '✅ تطابق سيارة الكراج'}
                </h3>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>
                  النتائج مخصصة لسيارتك: <span style={{ color: '#e11d48', fontWeight: 800 }}>{fitment.make} {fitment.model} {fitment.year}</span>
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
               <Globe size={20} color="#e11d48" />
               <span style={{ fontWeight: 800, color: '#e11d48', fontSize: '0.9rem' }}>
                 تم تفعيل "البحث العالمي": يتم الآن عرض قطع من الموردين الدوليين والمحليين معاً.
               </span>
            </div>
          )}
        </div>

        {/* Location Banner */}
        {position && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.05)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            padding: '0.8rem 1.5rem',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <div style={{
                width: '10px', height: '10px',
                borderRadius: '50%',
                background: '#10b981',
                boxShadow: '0 0 8px rgba(16,185,129,0.5)',
              }} />
              <span style={{ fontWeight: 800, color: '#10b981', fontSize: '0.9rem' }}>
                📍 الموقع مفعّل — المسافات محسوبة من موقعك
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {[5, 10, 25, 50, 0].map(d => (
                <button
                  key={d}
                  onClick={() => setDistanceRange(d)}
                  style={{
                    padding: '0.4rem 0.9rem',
                    borderRadius: '8px',
                    border: distanceRange === d ? '1px solid #10b981' : '1px solid var(--border)',
                    background: distanceRange === d ? 'rgba(16,185,129,0.15)' : 'var(--surface)',
                    color: distanceRange === d ? '#10b981' : 'var(--text-secondary)',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    transition: '0.2s',
                  }}
                >
                  {d === 0 ? 'الكل' : `${d} كم`}
                </button>
              ))}
            </div>
          </div>
        )}

        {!position && sortBy === 'nearest' && (
          <div style={{
            background: 'rgba(245, 158, 11, 0.05)',
            border: '1px solid rgba(245, 158, 11, 0.2)',
            padding: '1rem 1.5rem',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
          }}>
            <MapPin size={20} color="#f59e0b" />
            <span style={{ fontWeight: 800, color: '#f59e0b', fontSize: '0.9rem', flex: 1 }}>
              لاستخدام ترتيب "الأقرب إليك"، يرجى تفعيل خدمة الموقع
            </span>
            <button
              onClick={requestLocation}
              disabled={geoLoading}
              style={{
                padding: '0.6rem 1.2rem',
                borderRadius: '10px',
                border: '1px solid rgba(245,158,11,0.3)',
                background: 'rgba(245,158,11,0.08)',
                color: '#f59e0b',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: geoLoading ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Locate size={16} />
              {geoLoading ? 'جاري التحديد...' : 'تفعيل الموقع'}
            </button>
          </div>
        )}

        {/* Breadcrumb & Header */}
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem', fontWeight: 600 }}>
             الرئيسية <span style={{ margin: '0 0.5rem', opacity: 0.5 }}>/</span> <span style={{ color: 'var(--text-primary)' }}>كل القطع ({filteredSortedProducts.length})</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 950, margin: 0, color: 'var(--text-primary)' }}>تسوق قطع الغيار</h1>
              <div style={{ width: '60px', height: '2px', background: 'linear-gradient(90deg, #D4AF37, transparent)', marginTop: '0.8rem', boxShadow: '0 0 15px rgba(212,175,55,0.3)' }} />
            </div>
            
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
                  e.currentTarget.style.borderColor = '#e11d48';
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(225,29,72,0.15)';
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
        <div className="products-page-layout" style={{ display: 'flex', gap: '3rem', alignItems: 'flex-start' }}>
          {/* Sidebar — Desktop Only */}
          <div className="sidebar-container desktop-only" style={{ width: '300px', flexShrink: 0 }}>
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

        {/* ═══ MOBILE FILTER SHEET ═══ */}
        <MobileFilterSheet
          filters={filters}
          setFilters={setFilters}
          clearFilters={clearFilters}
          brands={brands}
          sortBy={sortBy}
          setSortBy={setSortBy}
          totalResults={filteredSortedProducts.length}
        />
      </div>
    </main>
  );
}

/* ═══════════════════════════════════════════
   MOBILE FILTER SHEET COMPONENT
═══════════════════════════════════════════ */
function MobileFilterSheet({ filters, setFilters, clearFilters, brands, sortBy, setSortBy, totalResults }: {
  filters: any;
  setFilters: (f: any) => void;
  clearFilters: () => void;
  brands: string[];
  sortBy: string;
  setSortBy: (s: string) => void;
  totalResults: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [priceRange, setPriceRange] = useState(500);

  const activeFiltersCount = [
    filters.brand,
    filters.condition,
    filters.category,
    filters.minRating > 0,
    filters.minPrice || filters.maxPrice,
  ].filter(Boolean).length;

  return (
    <>
      {/* Floating Filter Button — Mobile Only */}
      <button
        className="mobile-only"
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '80px',
          left: '1rem',
          zIndex: 99990,
          display: 'none',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.7rem 1.2rem',
          borderRadius: '14px',
          background: 'linear-gradient(135deg, #e11d48, #be123c)',
          color: '#fff',
          border: 'none',
          fontWeight: 800,
          fontSize: '0.85rem',
          cursor: 'pointer',
          boxShadow: '0 6px 20px rgba(225,29,72,0.4)',
        }}
      >
        <SlidersHorizontal size={16} /> فلترة
        {activeFiltersCount > 0 && (
          <span style={{
            background: '#fff', color: '#e11d48',
            borderRadius: '50%', width: '18px', height: '18px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.65rem', fontWeight: 900,
          }}>
            {activeFiltersCount}
          </span>
        )}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 999998,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
          }}
        />
      )}

      {/* Bottom Sheet */}
      <div style={{
        position: 'fixed',
        bottom: isOpen ? 0 : '-100%',
        left: 0, right: 0,
        zIndex: 999999,
        background: 'var(--surface)',
        borderRadius: '20px 20px 0 0',
        maxHeight: '85vh',
        overflowY: 'auto',
        transition: 'bottom 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '0 -10px 40px rgba(0,0,0,0.2)',
      }}>
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '0.8rem 0 0' }}>
          <div style={{ width: '40px', height: '4px', borderRadius: '2px', background: 'var(--border)' }} />
        </div>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem 1.2rem', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: 'var(--text-primary)' }}>
            فلترة وترتيب
          </h3>
          <button onClick={clearFilters} style={{ background: 'none', border: 'none', color: '#e11d48', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer' }}>
            مسح الكل
          </button>
        </div>

        <div style={{ padding: '1rem 1.2rem 2rem' }}>
          {/* Sort */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ margin: '0 0 0.6rem', fontSize: '0.85rem', fontWeight: 800, color: '#e11d48' }}>الترتيب</h4>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {[
                { value: 'popular', label: 'الأكثر شعبية' },
                { value: 'price_low', label: 'الأرخص' },
                { value: 'price_high', label: 'الأغلى' },
                { value: 'rating', label: 'الأعلى تقييم' },
                { value: 'newest', label: 'الأحدث' },
              ].map(s => (
                <button
                  key={s.value}
                  onClick={() => setSortBy(s.value)}
                  style={{
                    padding: '0.5rem 0.9rem', borderRadius: '10px',
                    border: sortBy === s.value ? '1px solid #e11d48' : '1px solid var(--border)',
                    background: sortBy === s.value ? 'rgba(225,29,72,0.1)' : 'var(--surface-hover)',
                    color: sortBy === s.value ? '#e11d48' : 'var(--text-secondary)',
                    fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer',
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Condition */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ margin: '0 0 0.6rem', fontSize: '0.85rem', fontWeight: 800, color: '#e11d48' }}>الحالة</h4>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {['', 'جديد', 'مستعمل'].map(c => (
                <button
                  key={c}
                  onClick={() => setFilters({ ...filters, condition: c })}
                  style={{
                    padding: '0.5rem 1rem', borderRadius: '10px',
                    border: filters.condition === c ? '1px solid #e11d48' : '1px solid var(--border)',
                    background: filters.condition === c ? 'rgba(225,29,72,0.1)' : 'var(--surface-hover)',
                    color: filters.condition === c ? '#e11d48' : 'var(--text-secondary)',
                    fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer',
                  }}
                >
                  {c || 'الكل'}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ margin: '0 0 0.6rem', fontSize: '0.85rem', fontWeight: 800, color: '#e11d48' }}>
              السعر: حتى {priceRange} ر.س
            </h4>
            <input
              type="range"
              min="10"
              max="5000"
              step="10"
              value={priceRange}
              onChange={e => {
                const v = Number(e.target.value);
                setPriceRange(v);
                setFilters({ ...filters, maxPrice: v.toString() });
              }}
              style={{ width: '100%', accentColor: '#e11d48' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              <span>10 ر.س</span>
              <span>5,000 ر.س</span>
            </div>
          </div>

          {/* Brand */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ margin: '0 0 0.6rem', fontSize: '0.85rem', fontWeight: 800, color: '#e11d48' }}>الماركة</h4>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', maxHeight: '120px', overflowY: 'auto' }}>
              <button
                onClick={() => setFilters({ ...filters, brand: '' })}
                style={{
                  padding: '0.45rem 0.8rem', borderRadius: '8px',
                  border: !filters.brand ? '1px solid #e11d48' : '1px solid var(--border)',
                  background: !filters.brand ? 'rgba(225,29,72,0.1)' : 'var(--surface-hover)',
                  color: !filters.brand ? '#e11d48' : 'var(--text-secondary)',
                  fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer',
                }}
              >
                الكل
              </button>
              {brands.slice(0, 15).map(b => (
                <button
                  key={b}
                  onClick={() => setFilters({ ...filters, brand: b })}
                  style={{
                    padding: '0.45rem 0.8rem', borderRadius: '8px',
                    border: filters.brand === b ? '1px solid #e11d48' : '1px solid var(--border)',
                    background: filters.brand === b ? 'rgba(225,29,72,0.1)' : 'var(--surface-hover)',
                    color: filters.brand === b ? '#e11d48' : 'var(--text-secondary)',
                    fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer',
                  }}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Apply Button */}
          <button
            onClick={() => setIsOpen(false)}
            style={{
              width: '100%', padding: '0.9rem',
              borderRadius: '14px', border: 'none',
              background: 'linear-gradient(135deg, #e11d48, #be123c)',
              color: '#fff', fontWeight: 900, fontSize: '1rem',
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(225,29,72,0.3)',
            }}
          >
            عرض {totalResults} نتيجة
          </button>
        </div>
      </div>
    </>
  );
}
