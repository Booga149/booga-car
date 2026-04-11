"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Car, ChevronDown } from 'lucide-react';

const carMakes: Record<string, string[]> = {
  'Toyota': ['كامري', 'كورولا', 'لاند كروزر', 'هايلكس', 'بريوس', 'RAV4', 'يارس', 'أفالون', 'فورتشنر', 'إنوفا', 'FJ كروزر', 'برادو'],
  'Hyundai': ['سوناتا', 'إلنترا', 'أكسنت', 'توسان', 'سانتافي', 'كريتا', 'ستاريا', 'أزيرا', 'باليسيد', 'كونا', 'فينيو'],
  'Kia': ['سيراتو', 'سبورتاج', 'سورينتو', 'K5', 'سيلتوس', 'كارنيفال', 'ريو', 'تيلورايد', 'EV6', 'بيكانتو'],
  'Nissan': ['باترول', 'ألتيما', 'سنترا', 'صني', 'إكستريل', 'كيكس', 'نافارا', 'ماكسيما', 'باثفايندر', 'أورفان'],
  'Chevrolet': ['ماليبو', 'كابتيفا', 'تاهو', 'سيلفرادو', 'إكوينوكس', 'ترافيرس', 'سوبربان', 'بليزر', 'كمارو', 'كورفيت'],
  'Ford': ['إكسبلورر', 'توروس', 'إكسبيديشن', 'فوكس', 'برونكو', 'رابتر', 'F-150', 'إيدج', 'إيكوسبورت', 'موستنج'],
  'Honda': ['أكورد', 'سيفيك', 'CR-V', 'بايلوت', 'سيتي', 'HR-V', 'أوديسي'],
  'Mercedes': ['C-Class', 'E-Class', 'S-Class', 'GLC', 'GLE', 'GLS', 'A-Class', 'CLA', 'AMG GT'],
  'BMW': ['3 Series', '5 Series', '7 Series', 'X3', 'X5', 'X7', 'X1', '4 Series', 'M3', 'M5'],
  'Lexus': ['ES', 'IS', 'GS', 'LS', 'RX', 'NX', 'GX', 'LX', 'UX', 'LC'],
  'GMC': ['يوكون', 'سييرا', 'تيرين', 'أكاديا', 'سافانا'],
  'Dodge': ['تشارجر', 'تشالنجر', 'دورانجو', 'رام'],
  'Jeep': ['جراند شيروكي', 'رانجلر', 'شيروكي', 'كومباس', 'جلاديتور'],
  'MG': ['MG5', 'MG6', 'ZS', 'HS', 'RX5', 'RX8'],
  'Changan': ['CS35', 'CS55', 'CS75', 'CS85', 'إيدو', 'ألسفن'],
  'Geely': ['إمجراند', 'كولراي', 'أزكارا', 'مونجارو', 'ستارري'],
  'BYD': ['هان', 'تانج', 'سونغ', 'دولفين', 'سيل', 'أتو 3'],
  'Haval': ['H6', 'جوليان', 'داراجو', 'H9'],
};

const years = Array.from({ length: 35 }, (_, i) => String(2026 - i));

export default function VehicleSearch() {
  const router = useRouter();
  const [selectedMake, setSelectedMake] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  const models = selectedMake ? carMakes[selectedMake] || [] : [];

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (selectedMake) params.set('make', selectedMake);
    if (selectedModel) params.set('model', selectedModel);
    if (selectedYear) params.set('year', selectedYear);
    router.push(`/products?${params.toString()}`);
  };

  const canSearch = selectedMake || selectedModel;

  const selectStyle: React.CSSProperties = {
    flex: 1,
    minWidth: '160px',
    padding: '1rem 1rem',
    background: 'rgba(255,255,255,0.06)',
    border: '1.5px solid rgba(255,255,255,0.12)',
    borderRadius: '14px',
    color: 'white',
    fontSize: '0.95rem',
    fontWeight: 700,
    cursor: 'pointer',
    outline: 'none',
    appearance: 'none' as const,
    WebkitAppearance: 'none' as const,
    backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' fill=\'white\' viewBox=\'0 0 16 16\'%3E%3Cpath d=\'M8 11L3 6h10z\'/%3E%3C/svg%3E")',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'left 1rem center',
    transition: 'all 0.3s',
  };

  return (
    <div className="vehicle-search-box" style={{
      background: 'rgba(0, 0, 0, 0.55)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderRadius: '24px',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      padding: '2rem',
      maxWidth: '900px',
      margin: '0 auto',
      boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.7rem',
        marginBottom: '1.3rem',
      }}>
        <div style={{
          width: '38px', height: '38px', borderRadius: '12px',
          background: 'linear-gradient(135deg, var(--primary), #f97316)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Car size={20} color="white" />
        </div>
        <div>
          <div className="vs-header-title" style={{ fontWeight: 900, color: 'white', fontSize: '1.1rem' }}>
            ابحث عن قطعة لسيارتك
          </div>
          <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
            اختر الماركة والموديل وهنلاقيلك القطعة المناسبة
          </div>
        </div>
      </div>

      <div className="vs-selects" style={{
        display: 'flex', flexWrap: 'wrap', gap: '0.8rem',
        alignItems: 'center',
      }}>
        <select value={selectedMake}
          onChange={e => { setSelectedMake(e.target.value); setSelectedModel(''); }}
          style={selectStyle}>
          <option value="" style={{ color: '#333' }}>🚗 الماركة</option>
          {Object.keys(carMakes).map(make => (
            <option key={make} value={make} style={{ color: '#333' }}>{make}</option>
          ))}
        </select>

        <select value={selectedModel}
          onChange={e => setSelectedModel(e.target.value)}
          style={{ ...selectStyle, opacity: models.length ? 1 : 0.5 }}
          disabled={!models.length}>
          <option value="" style={{ color: '#333' }}>📋 الموديل</option>
          {models.map(model => (
            <option key={model} value={model} style={{ color: '#333' }}>{model}</option>
          ))}
        </select>

        <select value={selectedYear}
          onChange={e => setSelectedYear(e.target.value)}
          style={{ ...selectStyle, maxWidth: '140px' }}>
          <option value="" style={{ color: '#333' }}>📅 السنة</option>
          {years.map(y => (
            <option key={y} value={y} style={{ color: '#333' }}>{y}</option>
          ))}
        </select>

        <button onClick={handleSearch}
          disabled={!canSearch}
          style={{
            padding: '1rem 2rem',
            background: canSearch
              ? 'linear-gradient(135deg, var(--primary), #f97316)'
              : 'rgba(255,255,255,0.1)',
            color: 'white',
            border: 'none',
            borderRadius: '14px',
            fontWeight: 900,
            fontSize: '1rem',
            cursor: canSearch ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: canSearch ? '0 8px 25px rgba(244, 63, 94, 0.4)' : 'none',
            transition: 'all 0.3s',
            whiteSpace: 'nowrap',
          }}>
          <Search size={18} /> ابحث
        </button>
      </div>

      {/* Quick link */}
      <div style={{
        marginTop: '1rem', textAlign: 'center',
        fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)',
      }}>
        مالقيت قطعتك؟{' '}
        <a href="/request-part" style={{
          color: 'var(--primary)', fontWeight: 800,
          textDecoration: 'none',
        }}>
          اطلبها وإحنا ندور لك! ←
        </a>
      </div>
    </div>
  );
}
