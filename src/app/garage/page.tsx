"use client";
import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/context/ToastContext';
import { Car, Settings, Toolbox, Hash, Calendar, ChevronRight, AlertTriangle, Plus, ShoppingCart, RefreshCw, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface UserVehicle {
  id: string;
  vin: string;
  make: string;
  model: string;
  year: string;
  current_mileage: number;
  last_oil_service: number;
  last_brake_service: number;
  nickname?: string;
}

export default function GaragePage() {
  const { user, loading: authLoading } = useAuth();
  const { addToast } = useToast();
  const [vehicles, setVehicles] = useState<UserVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = '/';
      return;
    }
    if (user) {
      fetchVehicles();
    }
  }, [user, authLoading]);

  const fetchVehicles = async () => {
    try {
      const { data, error } = await supabase
        .from('user_vehicles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setVehicles(data || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateMileage = async (id: string, newMileage: number, type: 'current' | 'oil' | 'brake') => {
    setUpdatingId(id);
    const updates: any = {};
    if (type === 'current') updates.current_mileage = newMileage;
    if (type === 'oil') updates.last_oil_service = newMileage;
    if (type === 'brake') updates.last_brake_service = newMileage;

    try {
      const { error } = await supabase.from('user_vehicles').update(updates).eq('id', id);
      if (error) throw error;
      addToast('تم تحديث البيانات بنجاح', 'success');
      fetchVehicles();
    } catch (err: any) {
      addToast(err.message, 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteVehicle = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه السيارة من كراجك؟')) return;
    try {
      const { error } = await supabase.from('user_vehicles').delete().eq('id', id);
      if (error) throw error;
      addToast('تم حذف السيارة', 'info');
      fetchVehicles();
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  if (loading || authLoading) {
    return (
      <main style={{ minHeight: '100vh', background: 'var(--background)' }}>
        <Navbar />
        <div style={{ padding: '8rem 2rem', textAlign: 'center' }}>جاري تحميل كراجك...</div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--background)', color: 'var(--text-primary)' }}>
      <Navbar />
      
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '8rem 2rem 5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>كراجي الشخصي 🚗</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>إدارة صيانة سياراتك والحصول على القطع المتوافقة بسهولة.</p>
          </div>
          <Link href="/" style={{ 
            background: 'var(--primary)', color: 'white', textDecoration: 'none', padding: '1rem 2rem', 
            borderRadius: '14px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.8rem',
            boxShadow: '0 8px 20px rgba(244, 63, 94, 0.2)'
          }}>
            <Plus size={20} /> إضافة سيارة جديدة
          </Link>
        </div>

        {vehicles.length === 0 ? (
          <div style={{ 
            padding: '5rem 2rem', textAlign: 'center', background: 'var(--surface)', 
            borderRadius: '24px', border: '2px dashed var(--border)' 
          }}>
            <Car size={64} style={{ opacity: 0.2, marginBottom: '1.5rem' }} />
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>كراجك فارغ حالياً</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>أضف سيارتك عبر رقم الهيكل لتفعيل منبه الصيانة والحصول على قطع غيار دقيقة.</p>
            <Link href="/" style={{ color: 'var(--primary)', fontWeight: 800, textDecoration: 'none' }}>انتقل للبحث برقم الهيكل الآن ←</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {vehicles.map(vehicle => {
              const oilInterval = 10000;
              const brakeInterval = 40000;
              const oilProgress = Math.min(100, ((vehicle.current_mileage - vehicle.last_oil_service) / oilInterval) * 100);
              const brakeProgress = Math.min(100, ((vehicle.current_mileage - vehicle.last_brake_service) / brakeInterval) * 100);
              const oilDue = vehicle.current_mileage - vehicle.last_oil_service >= oilInterval;

              return (
                <div key={vehicle.id} style={{ 
                  background: 'var(--surface)', borderRadius: '24px', border: '1px solid var(--border)', 
                  padding: '2rem', boxShadow: 'var(--card-shadow)', display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem'
                }}>
                  {/* Left: Vehicle Info */}
                  <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                      <div style={{ background: 'var(--primary)', color: 'white', padding: '0.5rem 1rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 900 }}>
                        {vehicle.year}
                      </div>
                      <button onClick={() => deleteVehicle(vehicle.id)} style={{ background: 'transparent', border: 'none', color: '#ff4d4d', cursor: 'pointer', opacity: 0.5 }}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.5rem' }}>{vehicle.make} {vehicle.model}</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                      <Hash size={16} /> VIN: <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{vehicle.vin}</span>
                    </div>

                    <div style={{ background: 'var(--surface-hover)', padding: '1.5rem', borderRadius: '16px', marginBottom: '1.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                        <span style={{ fontWeight: 700 }}>الممشى الحالي:</span>
                        <input 
                          type="number" 
                          defaultValue={vehicle.current_mileage}
                          onBlur={(e) => updateMileage(vehicle.id, parseInt(e.target.value), 'current')}
                          style={{ width: '100px', background: 'var(--surface)', border: '1px solid var(--border)', padding: '0.4rem', borderRadius: '8px', textAlign: 'center', fontWeight: 800 }}
                        />
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'right' }}>كم (القراءة من لوحة القيادة)</div>
                    </div>

                    <Link href={`/products?make=${vehicle.make}&model=${vehicle.model}&year=${vehicle.year}&vin_verified=true`} style={{ 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem', 
                      background: 'var(--text-primary)', color: 'var(--surface)', textDecoration: 'none',
                      padding: '1rem', borderRadius: '12px', fontWeight: 800, transition: '0.2s'
                    }}>
                      <ShoppingCart size={18} /> تسوق القطع المتوافقة
                    </Link>
                  </div>

                  {/* Right: Maintenance Tracker */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <Toolbox size={20} color="var(--primary)" /> حالة الصيانة الدورية
                    </h3>

                    {/* Oil Change */}
                    <div style={{ background: 'var(--surface-hover)', padding: '1.5rem', borderRadius: '20px', position: 'relative' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <span style={{ fontWeight: 700 }}>تغيير زيت المحرك</span>
                        <span style={{ color: oilDue ? '#ff4d4d' : 'var(--text-secondary)', fontWeight: 800 }}>
                          {oilDue ? '⚠️ موعد التغيير حان!' : `فاضل لك ${oilInterval - (vehicle.current_mileage - vehicle.last_oil_service)} كم`}
                        </span>
                      </div>
                      <div style={{ height: '12px', background: 'var(--border)', borderRadius: '6px', overflow: 'hidden', marginBottom: '1rem' }}>
                        <div style={{ 
                          width: `${oilProgress}%`, height: '100%', 
                          background: oilDue ? 'linear-gradient(90deg, #ff4d4d, #e63946)' : 'linear-gradient(90deg, #2563eb, #3b82f6)',
                          transition: '1s'
                        }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <button 
                          onClick={() => updateMileage(vehicle.id, vehicle.current_mileage, 'oil')}
                          style={{ background: 'transparent', border: '1px solid var(--border)', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}
                        >
                          تم التغيير الآن؟ ✅
                        </button>
                        <Link href="/products?category=زيوت وفلاتر" style={{ color: 'var(--primary)', fontSize: '0.9rem', fontWeight: 700, textDecoration: 'none' }}>تسوق الزيوت ←</Link>
                      </div>
                    </div>

                    {/* Brakes */}
                    <div style={{ background: 'var(--surface-hover)', padding: '1.5rem', borderRadius: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <span style={{ fontWeight: 700 }}>فحمات الفرامل</span>
                        <span style={{ color: 'var(--text-secondary)', fontWeight: 800 }}>
                          {brakeProgress}% تآكل تقديري
                        </span>
                      </div>
                      <div style={{ height: '12px', background: 'var(--border)', borderRadius: '6px', overflow: 'hidden', marginBottom: '1rem' }}>
                        <div style={{ 
                          width: `${brakeProgress}%`, height: '100%', 
                          background: brakeProgress > 80 ? 'orange' : '#8ac926',
                          transition: '1s'
                        }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <button 
                          onClick={() => updateMileage(vehicle.id, vehicle.current_mileage, 'brake')}
                          style={{ background: 'transparent', border: '1px solid var(--border)', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}
                        >
                          تم التغيير؟ ✅
                        </button>
                        <Link href="/products?category=فحمات وهوبات" style={{ color: 'var(--primary)', fontSize: '0.9rem', fontWeight: 700, textDecoration: 'none' }}>تسوق الفحمات ←</Link>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', background: 'rgba(255, 193, 7, 0.1)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255, 193, 7, 0.2)' }}>
                      <AlertTriangle size={20} color="#ffc107" />
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        هذه التقديرات مبنية على جداول الصيانة القياسية وممشى السيارة المدخل يدوياً. يرجى فحص سيارتك دورياً عند فني مختص.
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
