"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Radio } from 'lucide-react';

type TrackingLog = {
  id: string;
  type: string;
  title: string;
  message: string;
  created_at: string;
};

export default function LogsPage() {
  const [logs, setLogs] = useState<TrackingLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      const { data, error } = await supabase
        .from('admin_notifications')
        .select('id, title, message, created_at, type')
        .order('created_at', { ascending: false });
      
      if (data) setLogs(data);
      setLoading(false);
    }
    fetchLogs();
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', margin: '0 0 0.5rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            سجل المراقبة والتدفق <Radio size={28} />
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>تتبع دقيق لمواقع، عناوين IP، والأجهزة اللي بتسجل دخول في الموقع</p>
        </div>
      </div>

      <div className="glass-panel" style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
          <thead>
            <tr style={{ background: 'rgba(0,0,0,0.03)', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>وقت الدخول</th>
              <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>الحساب</th>
              <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>الـ IP Number</th>
              <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>دولة / مدينة الاختراق</th>
              <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>الجهاز / مزود الخدمة</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center' }}>جاري سحب السجلات...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>لا توجد سجلات دخول حتى الآن.</td></tr>
            ) : (
              logs.map(log => {
                // Parse the message that was generated in Navbar
                // Format: "الحساب: x | الـ IP: y | الموقع: z | الشبكة/الجهاز: w"
                const parts = log.message.split(' | ');
                const account = parts[0]?.replace('الحساب: ', '').replace('المستخدم ', '').replace(' حاول دخول لوحة الإدارة بدون صلاحيات.', '') || 'مجهول';
                const ip = parts[1]?.replace('الـ IP: ', '') || '-';
                const loc = parts[2]?.replace('الموقع: ', '') || '-';
                const device = parts[3]?.replace('الجهاز: ', '') || '-';
                
                return (
                  <tr key={log.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s', background: log.type === 'SECURITY_ALERT' ? 'rgba(230, 57, 70, 0.05)' : 'transparent' }} onMouseOver={e=>e.currentTarget.style.background='rgba(0,0,0,0.02)'} onMouseOut={e=>e.currentTarget.style.background=log.type === 'SECURITY_ALERT' ? 'rgba(230, 57, 70, 0.05)' : 'transparent'}>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)', direction: 'ltr', textAlign: 'right', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {log.type === 'SECURITY_ALERT' && <Radio size={14} color="var(--primary)" />}
                      {new Date(log.created_at).toLocaleString('ar-EG')}
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{account}</td>
                    <td style={{ padding: '1rem', color: '#4cc9f0', fontFamily: 'monospace', fontSize: '1.1rem' }}>{ip}</td>
                    <td style={{ padding: '1rem', color: '#8ac926' }}>{loc}</td>
                    <td style={{ padding: '1rem', color: '#aaa', fontSize: '0.9rem' }}>{device}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
