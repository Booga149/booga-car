"use client";
import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Loader2, MapPinOff, Store, Package, ChevronRight, Locate, Shield } from 'lucide-react';
import { useGeolocation, formatDistance, calculateDistance } from '@/hooks/useGeolocation';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface NearbySeller {
  id: string;
  full_name: string;
  business_name: string;
  city: string;
  address_text: string;
  latitude: number;
  longitude: number;
  avatar_url: string;
  distance_km: number;
  products_count: number;
}

// بيانات تجريبية للعرض عندما لا يوجد بائعين حقيقيين
const DEMO_SELLERS: NearbySeller[] = [
  { id: '1', full_name: 'محل الريادة لقطع الغيار', business_name: 'الريادة للسيارات', city: 'الرياض', address_text: 'حي العليا، طريق الملك فهد', latitude: 24.7136, longitude: 46.6753, avatar_url: '', distance_km: 2.3, products_count: 48 },
  { id: '2', full_name: 'مؤسسة النجم الذهبي', business_name: 'النجم الذهبي', city: 'الرياض', address_text: 'حي الملز، شارع الأحساء', latitude: 24.6588, longitude: 46.7224, avatar_url: '', distance_km: 5.7, products_count: 112 },
  { id: '3', full_name: 'مركز الأمان للقطع', business_name: 'مركز الأمان', city: 'الرياض', address_text: 'حي السلي، طريق خريص', latitude: 24.6271, longitude: 46.7880, avatar_url: '', distance_km: 8.1, products_count: 67 },
  { id: '4', full_name: 'توكيلات الخليج', business_name: 'توكيلات الخليج', city: 'جدة', address_text: 'حي الصفا، شارع التحلية', latitude: 21.5169, longitude: 39.2192, avatar_url: '', distance_km: 12.4, products_count: 203 },
  { id: '5', full_name: 'مجموعة السرعة', business_name: 'السرعة أوتو', city: 'الدمام', address_text: 'حي الفيصلية', latitude: 26.3927, longitude: 49.9777, avatar_url: '', distance_km: 18.9, products_count: 89 },
];

export default function NearbySellers() {
  const { position, error, isLoading: geoLoading, requestLocation, permissionState, isSupported } = useGeolocation(true);
  const [sellers, setSellers] = useState<NearbySeller[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [animateIn, setAnimateIn] = useState(false);

  // تحميل البائعين القريبين
  useEffect(() => {
    if (!position) return;

    async function fetchNearbySellers() {
      setIsLoading(true);
      try {
        if (isSupabaseConfigured) {
          const { data, error: dbError } = await supabase.rpc('get_nearby_sellers', {
            user_lat: position!.latitude,
            user_lon: position!.longitude,
            radius_km: 100,
          });

          if (data && data.length > 0) {
            setSellers(data);
          } else {
            // استخدام بيانات تجريبية مع حساب المسافة الحقيقية
            const demo = DEMO_SELLERS.map(s => ({
              ...s,
              distance_km: calculateDistance(position!.latitude, position!.longitude, s.latitude, s.longitude),
            })).sort((a, b) => a.distance_km - b.distance_km);
            setSellers(demo);
          }
        } else {
          const demo = DEMO_SELLERS.map(s => ({
            ...s,
            distance_km: calculateDistance(position!.latitude, position!.longitude, s.latitude, s.longitude),
          })).sort((a, b) => a.distance_km - b.distance_km);
          setSellers(demo);
        }
      } catch (err) {
        console.error('Error fetching nearby sellers:', err);
        setSellers(DEMO_SELLERS);
      } finally {
        setIsLoading(false);
        setTimeout(() => setAnimateIn(true), 100);
      }
    }

    fetchNearbySellers();
  }, [position]);

  const displayedSellers = showAll ? sellers : sellers.slice(0, 4);

  // حالة: المتصفح لا يدعم
  if (!isSupported) return null;

  return (
    <section id="nearby-sellers" style={{
      padding: '5rem 2rem',
      position: 'relative',
      zIndex: 10,
      overflow: 'hidden',
    }}>
      {/* خلفية متدرجة */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(180deg, rgba(5,5,5,0.95) 0%, rgba(15,15,25,0.98) 50%, rgba(5,5,5,0.95) 100%)',
        zIndex: 0,
      }} />

      {/* نقاط زخرفية */}
      <div style={{
        position: 'absolute',
        top: '10%', right: '5%',
        width: '300px', height: '300px',
        background: 'radial-gradient(circle, rgba(225,29,72,0.08) 0%, transparent 70%)',
        borderRadius: '50%',
        zIndex: 0,
        filter: 'blur(40px)',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '10%', left: '5%',
        width: '250px', height: '250px',
        background: 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)',
        borderRadius: '50%',
        zIndex: 0,
        filter: 'blur(40px)',
      }} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* العنوان */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: '3rem',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}>
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              marginBottom: '0.8rem',
            }}>
              <div style={{
                width: '36px', height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #e11d48, #be123c)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 25px rgba(225,29,72,0.3)',
              }}>
                <MapPin size={18} color="#fff" />
              </div>
              <span style={{
                color: '#e11d48',
                fontWeight: 900,
                textTransform: 'uppercase',
                fontSize: '0.85rem',
                letterSpacing: '2px',
              }}>
                الأقرب إليك
              </span>
            </div>
            <h2 style={{
              margin: 0,
              fontSize: '2.5rem',
              fontWeight: 950,
              color: 'white',
              lineHeight: 1.2,
            }}>
              محلات قطع الغيار{' '}
              <span style={{
                background: 'linear-gradient(135deg, #e11d48, #f43f5e)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                حولك
              </span>
            </h2>
          </div>

          {/* حالة الموقع */}
          {position ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.8rem',
              padding: '0.6rem 1.2rem',
              borderRadius: '50px',
              background: 'rgba(16,185,129,0.08)',
              border: '1px solid rgba(16,185,129,0.2)',
            }}>
              <div style={{
                width: '10px', height: '10px',
                borderRadius: '50%',
                background: '#10b981',
                boxShadow: '0 0 10px rgba(16,185,129,0.5)',
                animation: 'pulse 2s infinite',
              }} />
              <span style={{ color: '#10b981', fontSize: '0.85rem', fontWeight: 800 }}>
                📍 الموقع مفعّل
              </span>
            </div>
          ) : null}
        </div>

        {/* حالة: لم يتم تحديد الموقع بعد */}
        {!position && !geoLoading && !error && (
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '24px',
            padding: '4rem 3rem',
            textAlign: 'center',
            backdropFilter: 'blur(10px)',
          }}>
            <div style={{
              width: '80px', height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(225,29,72,0.1), rgba(225,29,72,0.05))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              border: '2px solid rgba(225,29,72,0.15)',
            }}>
              <Navigation size={32} color="#e11d48" />
            </div>
            <h3 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.8rem' }}>
              اكتشف أقرب المحلات إليك
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1rem', marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem', lineHeight: 1.7 }}>
              فعّل خدمة الموقع لعرض محلات قطع الغيار والبائعين الأقرب لك مع المسافة المقدرة
            </p>
            <button
              onClick={requestLocation}
              style={{
                padding: '1rem 2.5rem',
                borderRadius: '16px',
                border: 'none',
                background: 'linear-gradient(135deg, #e11d48, #be123c)',
                color: 'white',
                fontWeight: 900,
                fontSize: '1.1rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.8rem',
                boxShadow: '0 15px 40px rgba(225,29,72,0.3)',
                transition: 'all 0.3s ease',
              }}
              onMouseOver={e => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 20px 50px rgba(225,29,72,0.4)';
              }}
              onMouseOut={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 15px 40px rgba(225,29,72,0.3)';
              }}
            >
              <Locate size={20} />
              شارك موقعك
            </button>
          </div>
        )}

        {/* حالة: جاري التحميل */}
        {(geoLoading || isLoading) && (
          <div style={{
            textAlign: 'center',
            padding: '4rem',
          }}>
            <div style={{
              width: '60px', height: '60px',
              borderRadius: '50%',
              border: '3px solid rgba(225,29,72,0.15)',
              borderTopColor: '#e11d48',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1.5rem',
            }} />
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1rem', fontWeight: 700 }}>
              {geoLoading ? 'جاري تحديد موقعك...' : 'جاري البحث عن محلات قريبة...'}
            </p>
          </div>
        )}

        {/* حالة: خطأ */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.05)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: '20px',
            padding: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            flexWrap: 'wrap',
          }}>
            <div style={{
              width: '48px', height: '48px',
              borderRadius: '12px',
              background: 'rgba(239,68,68,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <MapPinOff size={24} color="#ef4444" />
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ color: '#ef4444', margin: '0 0 0.3rem', fontWeight: 900, fontSize: '1rem' }}>
                تعذر تحديد موقعك
              </h4>
              <p style={{ color: 'rgba(255,255,255,0.5)', margin: 0, fontSize: '0.9rem' }}>
                {error} — يمكنك المحاولة مرة أخرى أو تفعيل خدمة الموقع من إعدادات المتصفح
              </p>
            </div>
            <button
              onClick={requestLocation}
              style={{
                padding: '0.7rem 1.5rem',
                borderRadius: '12px',
                border: '1px solid rgba(239,68,68,0.3)',
                background: 'transparent',
                color: '#ef4444',
                fontWeight: 800,
                cursor: 'pointer',
                transition: '0.2s',
              }}
            >
              إعادة المحاولة
            </button>
          </div>
        )}

        {/* بطاقات البائعين */}
        {position && !isLoading && sellers.length > 0 && (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1.5rem',
            }}>
              {displayedSellers.map((seller, index) => (
                <div
                  key={seller.id}
                  style={{
                    background: hovered === seller.id
                      ? 'rgba(255,255,255,0.06)'
                      : 'rgba(255,255,255,0.03)',
                    border: hovered === seller.id
                      ? '1px solid rgba(225,29,72,0.3)'
                      : '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '20px',
                    padding: '1.8rem',
                    cursor: 'pointer',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: animateIn
                      ? (hovered === seller.id ? 'translateY(-6px)' : 'translateY(0)')
                      : 'translateY(20px)',
                    opacity: animateIn ? 1 : 0,
                    transitionDelay: `${index * 80}ms`,
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: hovered === seller.id
                      ? '0 20px 50px rgba(0,0,0,0.4), 0 0 30px rgba(225,29,72,0.05)'
                      : '0 5px 20px rgba(0,0,0,0.2)',
                  }}
                  onMouseEnter={() => setHovered(seller.id)}
                  onMouseLeave={() => setHovered(null)}
                >
                  {/* خط علوي ملون */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: index === 0
                      ? 'linear-gradient(90deg, #10b981, #059669)'
                      : index === 1
                        ? 'linear-gradient(90deg, #e11d48, #f43f5e)'
                        : 'linear-gradient(90deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                    opacity: hovered === seller.id ? 1 : 0.6,
                    transition: 'opacity 0.3s',
                  }} />

                  {/* شارة المسافة */}
                  <div style={{
                    position: 'absolute',
                    top: '1.2rem',
                    left: '1.2rem',
                    padding: '0.3rem 0.8rem',
                    borderRadius: '8px',
                    background: seller.distance_km <= 5
                      ? 'rgba(16,185,129,0.12)'
                      : seller.distance_km <= 15
                        ? 'rgba(245,158,11,0.12)'
                        : 'rgba(255,255,255,0.06)',
                    border: `1px solid ${seller.distance_km <= 5
                      ? 'rgba(16,185,129,0.25)'
                      : seller.distance_km <= 15
                        ? 'rgba(245,158,11,0.25)'
                        : 'rgba(255,255,255,0.1)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}>
                    <MapPin size={12} color={seller.distance_km <= 5 ? '#10b981' : seller.distance_km <= 15 ? '#f59e0b' : '#94a3b8'} />
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 900,
                      color: seller.distance_km <= 5 ? '#10b981' : seller.distance_km <= 15 ? '#f59e0b' : '#94a3b8',
                    }}>
                      {formatDistance(seller.distance_km)}
                    </span>
                  </div>

                  {/* المحتوى */}
                  <div style={{ marginTop: '2.5rem' }}>
                    {/* أيقونة المتجر */}
                    <div style={{
                      width: '52px', height: '52px',
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, rgba(225,29,72,0.1), rgba(225,29,72,0.05))',
                      border: '1px solid rgba(225,29,72,0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '1.2rem',
                    }}>
                      <Store size={24} color="#e11d48" />
                    </div>

                    {/* اسم المتجر */}
                    <h3 style={{
                      color: 'white',
                      fontSize: '1.1rem',
                      fontWeight: 900,
                      margin: '0 0 0.4rem',
                      lineHeight: 1.3,
                    }}>
                      {seller.business_name || seller.full_name}
                    </h3>

                    {/* المدينة */}
                    <p style={{
                      color: 'rgba(255,255,255,0.4)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      margin: '0 0 1.2rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                    }}>
                      <MapPin size={14} />
                      {seller.city || 'غير محدد'}
                      {seller.address_text && ` — ${seller.address_text}`}
                    </p>

                    {/* المعلومات السفلية */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: '1rem',
                      borderTop: '1px solid rgba(255,255,255,0.06)',
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}>
                        <Package size={14} color="rgba(255,255,255,0.4)" />
                        <span style={{
                          color: 'rgba(255,255,255,0.5)',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                        }}>
                          {seller.products_count} منتج
                        </span>
                      </div>

                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        color: '#e11d48',
                        fontSize: '0.8rem',
                        fontWeight: 800,
                        opacity: hovered === seller.id ? 1 : 0.7,
                        transition: '0.3s',
                      }}>
                        تصفح المنتجات
                        <ChevronRight size={14} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* زر عرض المزيد */}
            {sellers.length > 4 && (
              <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
                <button
                  onClick={() => setShowAll(!showAll)}
                  style={{
                    padding: '0.9rem 2.5rem',
                    borderRadius: '14px',
                    border: '1px solid rgba(225,29,72,0.3)',
                    background: 'rgba(225,29,72,0.05)',
                    color: '#e11d48',
                    fontWeight: 900,
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.background = 'rgba(225,29,72,0.1)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.background = 'rgba(225,29,72,0.05)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {showAll ? 'عرض أقل' : `عرض كل المحلات (${sellers.length})`}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </section>
  );
}
