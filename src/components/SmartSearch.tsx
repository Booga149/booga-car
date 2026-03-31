"use client";
import React, { useState, useEffect } from 'react';
import { Search, Globe, Car, Zap, Shield, Sparkles, Filter, CheckCircle2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { parseSmartSearch } from '@/lib/searchParser';
import { decodeVIN, DecodedVehicle } from '@/lib/vinDecoder';

export default function SmartSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isGlobal, setIsGlobal] = useState(false);
  const [savedCar, setSavedCar] = useState<{make: string, model: string, year: string} | null>(null);
  const [detectedVehicle, setDetectedVehicle] = useState<DecodedVehicle | null>(null);
  const [activeTab, setActiveTab] = useState<'smart' | 'manual'>('smart');
  const [manualMake, setManualMake] = useState('تويوتا');
  const [manualModel, setManualModel] = useState('كامري');
  const [manualYear, setManualYear] = useState('2022');
  const [manualPart, setManualPart] = useState('');
  const [isDecoding, setIsDecoding] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('booga_saved_car');
    if (saved) {
      try {
        setSavedCar(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  // Automatic VIN Detection logic
  useEffect(() => {
    const trimmed = query.trim().toUpperCase();
    if (trimmed.length === 17) {
      const runDecode = async () => {
        setIsDecoding(true);
        const vehicle = await decodeVIN(trimmed);
        if (vehicle) setDetectedVehicle(vehicle);
        setIsDecoding(false);
      };
      runDecode();
    } else {
      setDetectedVehicle(null);
    }
  }, [query]);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // If we have a detected vehicle from a VIN, prioritize it
    if (detectedVehicle) {
      const params = new URLSearchParams();
      params.set('make', detectedVehicle.make);
      if (detectedVehicle.model !== 'Unknown Model') params.set('model', detectedVehicle.model);
      params.set('year', detectedVehicle.year);
      params.set('vin_verified', 'true');
      router.push(`/products?${params.toString()}`);
      return;
    }

    if (!query.trim() && !savedCar) return;

    const parsed = parseSmartSearch(query);
    const params = new URLSearchParams();

    // Use parsed metadata or fallback to saved car
    let finalMake = parsed.make || savedCar?.make;
    let finalModel = parsed.model || savedCar?.model;
    let finalYear = parsed.year || savedCar?.year;

    if (activeTab === 'manual') {
      finalMake = manualMake;
      finalModel = manualModel;
      finalYear = manualYear;
    }

    if (finalMake) params.append('make', finalMake);
    if (finalModel) params.append('model', finalModel);
    if (finalYear) params.append('year', finalYear);
    
    // Attach text search query
    if (activeTab === 'manual' && manualPart.trim()) {
      params.append('search', manualPart.trim());
    } else if (parsed.query && activeTab === 'smart') {
      params.append('search', parsed.query);
    }
    
    if (isGlobal) params.append('global', 'true');

    router.push(`/products?${params.toString()}`);
  };

  const categories = [
    { id: 'brakes', name: 'فرامل', icon: <Zap size={20} />, color: '#f43f5e' },
    { id: 'filters', name: 'فلاتر', icon: <Filter size={20} />, color: '#3b82f6' },
    { id: 'lights', name: 'إضاءة', icon: <Sparkles size={20} />, color: '#fbbf24' },
    { id: 'engine', name: 'محركات', icon: <Car size={20} />, color: '#10b981' },
  ];

  const buttonStyle: React.CSSProperties = {
    background: 'var(--primary)',
    color: 'white',
    border: 'none',
    padding: '1.1rem 2.5rem',
    borderRadius: '18px',
    fontWeight: 900,
    fontSize: '1.1rem',
    cursor: 'pointer',
    transition: '0.2s',
    boxShadow: '0 8px 20px rgba(244, 63, 94, 0.25)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem'
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 25 }, (_, i) => (currentYear - i).toString());

  return (
    <div style={{ width: '100%', maxWidth: '850px', margin: '0 auto' }}>
      {/* ─── Search Container ─── */}
      <div style={{ 
        background: 'var(--surface)', 
        borderRadius: '24px', 
        padding: '0.6rem', 
        boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
        border: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.8rem'
      }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', padding: '0.4rem' }}>
          <button 
            type="button" 
            onClick={() => setActiveTab('smart')}
            style={{ 
              flex: 1, padding: '0.8rem', borderRadius: '16px', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer',
              background: activeTab === 'smart' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'smart' ? '#fff' : 'var(--text-secondary)',
              border: 'none', transition: '0.3s'
            }}
          >
            بحث برقم القطعة والهيكل الذكي
          </button>
          <button 
            type="button" 
            onClick={() => setActiveTab('manual')}
            style={{ 
              flex: 1, padding: '0.8rem', borderRadius: '16px', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer',
              background: activeTab === 'manual' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'manual' ? '#fff' : 'var(--text-secondary)',
              border: 'none', transition: '0.3s'
            }}
          >
             البحث باسم السيارة والماركة
          </button>
        </div>

        <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.4rem', flexDirection: activeTab === 'manual' ? 'column' : 'row' }}>
          
          {activeTab === 'smart' ? (
            <div style={{ flex: 1, position: 'relative', width: '100%' }}>
              <Search size={22} style={{ position: 'absolute', right: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input 
                type="text" 
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="مثال: فرامل كامري 2022 أو اكتب رقم الهيكل..." 
                style={{
                  width: '100%',
                  padding: '1.2rem 3.5rem 1.2rem 1.2rem',
                  borderRadius: '18px',
                  border: 'none',
                  background: 'var(--background)',
                  border: '1px solid var(--border)',
                  fontSize: '1.15rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  outline: 'none',
                }}
              />
              {/* Recognition Logic */}
              <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }}>
                 {isDecoding && <div className="spinner"></div>}
                 {detectedVehicle && (
                   <div style={{ 
                     background: 'var(--success)', color: 'white', padding: '0.3rem 0.8rem', 
                     borderRadius: '10px', fontSize: '0.85rem', fontWeight: 900, 
                     display: 'flex', alignItems: 'center', gap: '0.4rem'
                   }}>
                     <Shield size={16} /> تم التعرف: {detectedVehicle.make} {detectedVehicle.year}
                   </div>
                 )}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', width: '100%', gap: '1rem', background: 'var(--background)', padding: '0.8rem', borderRadius: '20px', border: '1px solid var(--border)' }}>
               <select value={manualMake} onChange={e => setManualMake(e.target.value)} style={{ flex: 1, minWidth: '100px', padding: '1rem', background: 'var(--surface)', color: 'var(--text-primary)', border: 'none', borderRadius: '12px', outline: 'none', fontWeight: 800 }}>
                 {['تويوتا', 'نيسان', 'هيونداي', 'كيا', 'فورد', 'شيفروليه', 'هوندا'].map(m => <option key={m} value={m}>{m}</option>)}
               </select>
               <select value={manualModel} onChange={e => setManualModel(e.target.value)} style={{ flex: 1, minWidth: '100px', padding: '1rem', background: 'var(--surface)', color: 'var(--text-primary)', border: 'none', borderRadius: '12px', outline: 'none', fontWeight: 800 }}>
                 {['كامري', 'كورولا', 'إلنترا', 'سوناتا', 'تورس', 'أكورد', 'سيفيك'].map(m => <option key={m} value={m}>{m}</option>)}
               </select>
               <select value={manualYear} onChange={e => setManualYear(e.target.value)} style={{ flex: 1, minWidth: '100px', padding: '1rem', background: 'var(--surface)', color: 'var(--text-primary)', border: 'none', borderRadius: '12px', outline: 'none', fontWeight: 800 }}>
                 {years.map(y => <option key={y} value={y}>{y}</option>)}
               </select>
               <div style={{ width: '100%', position: 'relative' }}>
                 <input 
                   type="text" 
                   value={manualPart}
                   onChange={e => setManualPart(e.target.value)}
                   placeholder="اسم القطعة المحددة (مثال: فحمات، فلتر...)" 
                   style={{
                     width: '100%', padding: '1rem', background: 'var(--surface)', color: 'var(--text-primary)',
                     border: '1px solid var(--border)', borderRadius: '12px', outline: 'none', fontWeight: 700
                   }}
                 />
               </div>
            </div>
          )}
          
          <button type="submit" style={{ ...buttonStyle, width: activeTab === 'manual' ? '100%' : 'auto', justifyContent: 'center' }}>
            {activeTab === 'manual' ? 'ابحث عن قطع الغيار' : 'بحث ذكي'} <Zap size={18} />
          </button>
        </form>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0.8rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 700 }}>بحث سريع:</span>
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              {categories.map(cat => (
                <button 
                  key={cat.id} 
                  type="button"
                  onClick={() => { setQuery(cat.name); }}
                  style={{
                    background: 'var(--surface-hover)',
                    border: '1px solid var(--border)',
                    padding: '0.5rem 1rem',
                    borderRadius: '12px',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    transition: '0.2s'
                  }}
                >
                  <span style={{ color: cat.color }}>{cat.icon}</span>
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
             <button 
               type="button"
               onClick={() => setIsGlobal(!isGlobal)}
               style={{
                 display: 'flex',
                 alignItems: 'center',
                 gap: '0.6rem',
                 padding: '0.6rem 1.2rem',
                 borderRadius: '14px',
                 background: isGlobal ? 'rgba(37, 99, 235, 0.1)' : 'var(--surface-hover)',
                 border: isGlobal ? '1px solid #3b82f6' : '1px solid var(--border)',
                 color: isGlobal ? '#3b82f6' : 'var(--text-secondary)',
                 fontSize: '0.9rem',
                 fontWeight: 800,
                 cursor: 'pointer',
                 transition: '0.2s'
               }}
             >
               <Globe size={18} /> بحث عالمي
             </button>
          </div>
        </div>
      </div>

      {/* ─── Garage Quick Action ─── */}
      {savedCar && (
        <div style={{ marginTop: '1.5rem' }}>
          <button 
            type="button"
            onClick={() => handleSearch()}
            style={{
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              padding: '1rem 2rem',
              borderRadius: '20px',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              color: '#10b981',
              fontWeight: 800,
              fontSize: '1.1rem',
              cursor: 'pointer',
              transition: '0.2s',
            }}
          >
            <div style={{ background: '#10b981', color: 'white', padding: '0.4rem', borderRadius: '8px', display: 'flex' }}>
              <CheckCircle2 size={20} />
            </div>
            <span>ابحث عن قطع متوافقة لسيارتك الحالية: {savedCar.make} {savedCar.model} {savedCar.year} ✨</span>
          </button>
        </div>
      )}
    </div>
  );
}
