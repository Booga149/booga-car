"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Users, Loader2, ShieldCheck, Building2, MapPin } from 'lucide-react';

type UserProfile = {
  id: string;
  email: string;
  full_name: string;
  role: 'customer' | 'admin' | 'seller';
  phone: string;
  business_name?: string;
  cr_number?: string;
  city?: string;
  created_at: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) {
        setUsers(data as UserProfile[]);
      }
      setLoading(false);
    }
    fetchUsers();
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', margin: '0 0 0.5rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
             إدارة المستخدمين والتجار <Users size={28} />
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>عرض جميع الحسابات المسجلة، التمييز بين العملاء والتجار، ومتابعة بيانات التوثيق.</p>
        </div>
        <div style={{ background: 'rgba(76, 201, 240, 0.1)', color: '#4cc9f0', padding: '1rem 2rem', borderRadius: '12px', fontWeight: 'bold', fontSize: '1.2rem', border: '1px solid rgba(76,201,240,0.3)' }}>
          {users.length} مستخدم
        </div>
      </div>
      
      <div className="glass-panel" style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #333' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
          <thead>
            <tr style={{ background: 'rgba(0,0,0,0.03)', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              <th style={{ padding: '1.2rem', borderBottom: '1px solid #333' }}>الحساب</th>
              <th style={{ padding: '1.2rem', borderBottom: '1px solid #333' }}>الرتبة</th>
              <th style={{ padding: '1.2rem', borderBottom: '1px solid #333' }}>بيانات العمل</th>
              <th style={{ padding: '1.2rem', borderBottom: '1px solid #333' }}>المدينة / الجوال</th>
              <th style={{ padding: '1.2rem', borderBottom: '1px solid #333' }}>تاريخ التسجيل</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-primary)' }}>جاري تحميل البيانات... <Loader2 size={18} style={{ animation: 'spin 2s linear infinite', verticalAlign: 'middle' }} /></td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>لا يوجد مستخدمين مسجلين بعد.</td></tr>
            ) : (
              users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid #222', transition: 'background 0.2s' }} onMouseOver={e=>e.currentTarget.style.background='rgba(0,0,0,0.02)'} onMouseOut={e=>e.currentTarget.style.background='transparent'}>
                  <td style={{ padding: '1rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                      <div style={{ 
                        width: '38px', height: '38px', borderRadius: '50%', 
                        background: u.role === 'seller' ? 'linear-gradient(135deg, #FFD700, #DAA520)' : 'linear-gradient(135deg, var(--primary), #d90429)', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: u.role === 'seller' ? '#000' : '#fff', fontSize: '1.1rem' 
                      }}>
                        {u.role === 'seller' ? <ShieldCheck size={20} /> : u.email?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                         <span style={{ fontSize: '1rem' }}>{u.full_name || 'بدون اسم'}</span>
                         <span dir="ltr" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{u.email}</span>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 800,
                      background: u.role === 'seller' ? 'rgba(218, 165, 32, 0.15)' : 'rgba(76, 201, 240, 0.15)',
                      color: u.role === 'seller' ? '#DAA520' : '#4cc9f0',
                      border: `1px solid ${u.role === 'seller' ? '#DAA520' : '#4cc9f0'}30`
                    }}>
                      {u.role === 'seller' ? 'تاجر موثوق' : u.role === 'admin' ? 'مدير' : 'عميل'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {u.role === 'seller' ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                         <span style={{ fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                           <Building2 size={14} /> {u.business_name}
                         </span>
                         <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>سجل: {u.cr_number}</span>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>لا يوجد بيانات عمل</span>
                    )}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                       <span style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                         <MapPin size={14} color="#8ac926" /> {u.city || '—'}
                       </span>
                       <span dir="ltr" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{u.phone || '—'}</span>
                    </div>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)', direction: 'ltr', textAlign: 'right' }}>
                    {new Date(u.created_at).toLocaleDateString('ar-EG')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
