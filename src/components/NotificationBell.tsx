"use client";
import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Bell, Package, DollarSign, Info, Check, X } from 'lucide-react';

type UserNotification = {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  is_read: boolean;
  created_at: string;
};

export default function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  useEffect(() => {
    if (!user) return;
    supabase.from('user_notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20).then(({ data }) => {
      if (data) setNotifications(data);
    });

    // Real-time subscription
    const channel = supabase.channel('user_notif').on('postgres_changes', {
      event: 'INSERT', schema: 'public', table: 'user_notifications', filter: `user_id=eq.${user.id}`
    }, (payload) => {
      setNotifications(prev => [payload.new as UserNotification, ...prev]);
    }).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markRead = async (id: string) => {
    await supabase.from('user_notifications').update({ is_read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllRead = async () => {
    if (!user) return;
    await supabase.from('user_notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'order_update': return <Package size={16} color="#3b82f6" />;
      case 'price_response': return <DollarSign size={16} color="#10b981" />;
      case 'promotion': return <Bell size={16} color="#f59e0b" />;
      default: return <Info size={16} color="var(--text-secondary)" />;
    }
  };

  if (!user) return null;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(!open)} style={{
        position: 'relative', background: 'none', border: 'none', cursor: 'pointer',
        padding: '0.5rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--text-secondary)', transition: '0.2s'
      }}>
        <Bell size={22} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: '2px', right: '2px', width: '18px', height: '18px',
            background: 'var(--primary)', color: 'white', borderRadius: '50%',
            fontSize: '0.65rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(225,29,72,0.4)', animation: 'pulse 2s infinite'
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '120%', left: '50%', transform: 'translateX(-50%)',
          width: '360px', maxHeight: '420px', overflowY: 'auto',
          background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)', zIndex: 99999, animation: 'fadeInUp 0.2s ease'
        }}>
          {/* Header */}
          <div style={{ padding: '1rem 1.2rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 900, color: 'var(--text-primary)' }}>الإشعارات</h3>
            {unreadCount > 0 && (
              <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 800, fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Check size={14} /> قراءة الكل
              </button>
            )}
          </div>

          {/* Notifications List */}
          {notifications.length === 0 ? (
            <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-secondary)', fontWeight: 700 }}>
              <Bell size={32} color="var(--border)" style={{ marginBottom: '0.8rem' }} />
              <p style={{ margin: 0, fontSize: '0.9rem' }}>لا توجد إشعارات</p>
            </div>
          ) : (
            notifications.map(n => (
              <div
                key={n.id}
                onClick={() => { markRead(n.id); if (n.link) window.location.href = n.link; }}
                style={{
                  padding: '1rem 1.2rem', borderBottom: '1px solid var(--border)',
                  display: 'flex', gap: '0.8rem', alignItems: 'flex-start',
                  background: n.is_read ? 'transparent' : 'rgba(225,29,72,0.03)',
                  cursor: n.link ? 'pointer' : 'default', transition: '0.2s'
                }}
              >
                <div style={{ flexShrink: 0, marginTop: '0.2rem' }}>{getIcon(n.type)}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <h4 style={{ margin: 0, fontSize: '0.88rem', fontWeight: n.is_read ? 700 : 900, color: 'var(--text-primary)' }}>{n.title}</h4>
                    {!n.is_read && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', flexShrink: 0, marginTop: '0.3rem' }} />}
                  </div>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, lineHeight: 1.5 }}>{n.message}</p>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600, opacity: 0.6 }}>
                    {new Date(n.created_at).toLocaleDateString('ar-SA')} • {new Date(n.created_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateX(-50%) translateY(8px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  );
}
