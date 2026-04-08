"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Radio, Monitor, Smartphone, Tablet, Globe, Shield, ShieldOff, Clock, Filter, RefreshCcw, TrendingUp, MapPin, Ban, Search, ChevronLeft, ChevronRight } from 'lucide-react';

type VisitorLog = {
  id: string;
  ip_address: string;
  country: string;
  city: string;
  device_type: string;
  browser: string;
  os: string;
  user_email: string | null;
  page_visited: string;
  referrer: string | null;
  is_blocked: boolean;
  created_at: string;
};

type Stats = {
  today: number;
  total: number;
  topCountry: string;
  topDevice: string;
  blocked: number;
};

const PAGE_SIZE = 25;

export default function LogsPage() {
  const [logs, setLogs] = useState<VisitorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({ today: 0, total: 0, topCountry: '-', topDevice: '-', blocked: 0 });
  const [filter, setFilter] = useState<'all' | 'mobile' | 'desktop' | 'blocked'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [blockingIp, setBlockingIp] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    
    let query = supabase
      .from('visitor_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (filter === 'mobile') query = query.eq('device_type', 'موبايل');
    else if (filter === 'desktop') query = query.eq('device_type', 'كمبيوتر');
    else if (filter === 'blocked') query = query.eq('is_blocked', true);

    if (searchQuery.trim()) {
      query = query.or(`ip_address.ilike.%${searchQuery}%,user_email.ilike.%${searchQuery}%,country.ilike.%${searchQuery}%`);
    }

    const { data, error } = await query;
    
    if (data) {
      setLogs(data);
      setHasMore(data.length === PAGE_SIZE);
    }
    if (error) console.error('Fetch logs error:', error);
    setLoading(false);
  }, [page, filter, searchQuery]);

  const fetchStats = useCallback(async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [totalRes, todayRes, blockedRes, allLogsRes] = await Promise.all([
        supabase.from('visitor_logs').select('id', { count: 'exact', head: true }),
        supabase.from('visitor_logs').select('id', { count: 'exact', head: true }).gte('created_at', today.toISOString()),
        supabase.from('blocked_ips').select('id', { count: 'exact', head: true }),
        supabase.from('visitor_logs').select('country, device_type').limit(500),
      ]);

      // Calculate top country and device
      let topCountry = '-';
      let topDevice = '-';
      
      if (allLogsRes.data && allLogsRes.data.length > 0) {
        const countryCounts: Record<string, number> = {};
        const deviceCounts: Record<string, number> = {};
        
        allLogsRes.data.forEach((log: any) => {
          if (log.country && log.country !== 'غير معروف') {
            countryCounts[log.country] = (countryCounts[log.country] || 0) + 1;
          }
          if (log.device_type) {
            deviceCounts[log.device_type] = (deviceCounts[log.device_type] || 0) + 1;
          }
        });

        const sortedCountries = Object.entries(countryCounts).sort(([,a], [,b]) => b - a);
        const sortedDevices = Object.entries(deviceCounts).sort(([,a], [,b]) => b - a);
        
        if (sortedCountries.length > 0) topCountry = sortedCountries[0][0];
        if (sortedDevices.length > 0) topDevice = sortedDevices[0][0];
      }

      setStats({
        total: totalRes.count || 0,
        today: todayRes.count || 0,
        blocked: blockedRes.count || 0,
        topCountry,
        topDevice,
      });
    } catch {}
  }, []);

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, [fetchLogs, fetchStats]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('visitor_logs_realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'visitor_logs' }, (payload) => {
        setLogs(prev => [payload.new as VisitorLog, ...prev.slice(0, PAGE_SIZE - 1)]);
        setStats(prev => ({ ...prev, total: prev.total + 1, today: prev.today + 1 }));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const blockIP = async (ip: string) => {
    setBlockingIp(ip);
    try {
      await supabase.from('blocked_ips').insert({ ip_address: ip, reason: 'محظور من لوحة التحكم' });
      await supabase.from('visitor_logs').update({ is_blocked: true }).eq('ip_address', ip);
      setLogs(prev => prev.map(l => l.ip_address === ip ? { ...l, is_blocked: true } : l));
      setStats(prev => ({ ...prev, blocked: prev.blocked + 1 }));
    } catch (err) {
      console.error('Block IP error:', err);
    }
    setBlockingIp(null);
  };

  const unblockIP = async (ip: string) => {
    setBlockingIp(ip);
    try {
      await supabase.from('blocked_ips').delete().eq('ip_address', ip);
      await supabase.from('visitor_logs').update({ is_blocked: false }).eq('ip_address', ip);
      setLogs(prev => prev.map(l => l.ip_address === ip ? { ...l, is_blocked: false } : l));
      setStats(prev => ({ ...prev, blocked: Math.max(0, prev.blocked - 1) }));
    } catch (err) {
      console.error('Unblock IP error:', err);
    }
    setBlockingIp(null);
  };

  const getDeviceIcon = (type: string) => {
    if (type === 'موبايل') return <Smartphone size={16} color="#f59e0b" />;
    if (type === 'تابلت') return <Tablet size={16} color="#b5179e" />;
    return <Monitor size={16} color="#4cc9f0" />;
  };

  const statCards = [
    { title: 'زوار اليوم', value: stats.today, icon: <TrendingUp size={24} />, color: '#10b981', glow: 'rgba(16,185,129,0.3)' },
    { title: 'إجمالي الزيارات', value: stats.total, icon: <Globe size={24} />, color: '#4cc9f0', glow: 'rgba(76,201,240,0.3)' },
    { title: 'أكثر دولة', value: stats.topCountry, icon: <MapPin size={24} />, color: '#f59e0b', glow: 'rgba(245,158,11,0.3)' },
    { title: 'أكثر جهاز', value: stats.topDevice, icon: <Monitor size={24} />, color: '#b5179e', glow: 'rgba(181,23,158,0.3)' },
    { title: 'IPs محظورة', value: stats.blocked, icon: <Ban size={24} />, color: '#f43f5e', glow: 'rgba(244,63,94,0.3)' },
  ];

  const filterButtons = [
    { key: 'all' as const, label: 'الكل', icon: <Globe size={14} /> },
    { key: 'desktop' as const, label: 'كمبيوتر', icon: <Monitor size={14} /> },
    { key: 'mobile' as const, label: 'موبايل', icon: <Smartphone size={14} /> },
    { key: 'blocked' as const, label: 'محظور', icon: <Ban size={14} /> },
  ];

  return (
    <div style={{ color: '#fff', paddingBottom: '4rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', margin: '0 0 0.5rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.8rem', fontWeight: 950 }}>
            <Radio size={28} color="#4cc9f0" style={{ filter: 'drop-shadow(0 0 10px rgba(76,201,240,0.5))' }} /> سجل المراقبة والتتبع
            <span style={{ fontSize: '0.7rem', color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '0.3rem 0.8rem', borderRadius: '20px', border: '1px solid rgba(16,185,129,0.3)', animation: 'blink 2s infinite', fontWeight: 900 }}>LIVE</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', margin: 0, fontWeight: 700 }}>تتبع مباشر لزيارات الموقع مع بيانات IP والموقع الجغرافي والأجهزة</p>
        </div>
        <button onClick={() => { setPage(0); fetchLogs(); fetchStats(); }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1.5rem', background: 'rgba(76,201,240,0.1)', border: '1px solid rgba(76,201,240,0.3)', borderRadius: '12px', color: '#4cc9f0', fontWeight: 900, cursor: 'pointer', transition: 'all 0.3s' }}>
          <RefreshCcw size={16} /> تحديث
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
        {statCards.map(stat => (
          <div key={stat.title} style={{
            background: 'rgba(10,10,15,0.6)', padding: '1.5rem', borderRadius: '18px',
            border: '1px solid rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden',
            boxShadow: `0 8px 24px rgba(0,0,0,0.4), inset 0 0 0 1px ${stat.glow}`,
            transition: 'all 0.3s'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>{stat.title}</span>
              <div style={{ color: stat.color, opacity: 0.6 }}>{stat.icon}</div>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 950, color: '#fff', textShadow: `0 0 15px ${stat.glow}` }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '0.3rem', background: 'rgba(0,0,0,0.4)', padding: '0.3rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
          {filterButtons.map(fb => (
            <button key={fb.key} onClick={() => { setFilter(fb.key); setPage(0); }} style={{
              padding: '0.6rem 1rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 900, cursor: 'pointer', transition: 'all 0.3s', border: 'none',
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              background: filter === fb.key ? '#4cc9f0' : 'transparent',
              color: filter === fb.key ? '#020205' : 'rgba(255,255,255,0.5)',
              boxShadow: filter === fb.key ? '0 0 15px rgba(76,201,240,0.5)' : 'none'
            }}>{fb.icon} {fb.label}</button>
          ))}
        </div>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <input
            type="text"
            placeholder="بحث بالـ IP أو الإيميل أو الدولة..."
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setPage(0); }}
            style={{
              width: '100%', padding: '0.8rem 1.2rem', paddingRight: '2.5rem',
              background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(76,201,240,0.2)',
              borderRadius: '12px', color: '#fff', fontSize: '0.9rem', outline: 'none', fontWeight: 600
            }}
          />
          <Search size={16} color="#4cc9f0" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }} />
        </div>
      </div>

      {/* Table */}
      <div style={{ background: 'rgba(10,10,15,0.7)', backdropFilter: 'blur(30px)', borderRadius: '20px', border: '1px solid rgba(76,201,240,0.15)', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.6)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', minWidth: '900px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(76,201,240,0.1)', background: 'rgba(76,201,240,0.03)' }}>
                <th style={{ padding: '1rem 1.2rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>وقت الدخول</th>
                <th style={{ padding: '1rem 1.2rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>الحساب</th>
                <th style={{ padding: '1rem 1.2rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>IP</th>
                <th style={{ padding: '1rem 1.2rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>الدولة / المدينة</th>
                <th style={{ padding: '1rem 1.2rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>الجهاز / المتصفح</th>
                <th style={{ padding: '1rem 1.2rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'center' }}>إجراء</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ padding: '4rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontWeight: 800, fontSize: '1.1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                    <Radio size={20} style={{ animation: 'blink 1s infinite' }} /> جاري سحب السجلات...
                  </div>
                </td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: '4rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontWeight: 800, fontSize: '1.1rem' }}>لا توجد سجلات مطابقة</td></tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id} style={{
                    borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'all 0.2s', cursor: 'default',
                    background: log.is_blocked ? 'rgba(244,63,94,0.05)' : 'transparent'
                  }}
                    onMouseOver={e => e.currentTarget.style.background = log.is_blocked ? 'rgba(244,63,94,0.08)' : 'rgba(76,201,240,0.03)'}
                    onMouseOut={e => e.currentTarget.style.background = log.is_blocked ? 'rgba(244,63,94,0.05)' : 'transparent'}
                  >
                    {/* Time */}
                    <td style={{ padding: '1rem 1.2rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.88rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Clock size={14} color="rgba(255,255,255,0.3)" />
                        {new Date(log.created_at).toLocaleString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    {/* Account */}
                    <td style={{ padding: '1rem 1.2rem', fontWeight: 800, color: log.user_email ? '#fff' : 'rgba(255,255,255,0.3)', fontSize: '0.9rem' }}>
                      {log.user_email || 'زائر مجهول'}
                    </td>
                    {/* IP */}
                    <td style={{ padding: '1rem 1.2rem', fontFamily: 'monospace', fontSize: '0.95rem', fontWeight: 800 }}>
                      <span style={{ color: log.is_blocked ? '#f43f5e' : '#4cc9f0' }}>{log.ip_address}</span>
                      {log.is_blocked && <Shield size={12} color="#f43f5e" style={{ marginRight: '0.4rem' }} />}
                    </td>
                    {/* Location */}
                    <td style={{ padding: '1rem 1.2rem', color: '#8ac926', fontWeight: 700, fontSize: '0.9rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <MapPin size={14} color="#8ac926" />
                        {log.country}{log.city && log.city !== 'غير معروف' ? ` - ${log.city}` : ''}
                      </div>
                    </td>
                    {/* Device */}
                    <td style={{ padding: '1rem 1.2rem', fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {getDeviceIcon(log.device_type)}
                        <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 700 }}>{log.device_type}</span>
                        <span style={{ color: 'rgba(255,255,255,0.3)' }}>|</span>
                        <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>{log.browser}</span>
                        <span style={{ color: 'rgba(255,255,255,0.3)' }}>|</span>
                        <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>{log.os}</span>
                      </div>
                    </td>
                    {/* Action */}
                    <td style={{ padding: '1rem 1.2rem', textAlign: 'center' }}>
                      {log.is_blocked ? (
                        <button onClick={() => unblockIP(log.ip_address)} disabled={blockingIp === log.ip_address} style={{
                          padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.3)',
                          background: 'rgba(16,185,129,0.1)', color: '#10b981', fontWeight: 800, fontSize: '0.75rem',
                          cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', transition: 'all 0.2s'
                        }}>
                          <ShieldOff size={12} /> رفع الحظر
                        </button>
                      ) : (
                        <button onClick={() => blockIP(log.ip_address)} disabled={blockingIp === log.ip_address} style={{
                          padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid rgba(244,63,94,0.3)',
                          background: 'rgba(244,63,94,0.05)', color: '#f43f5e', fontWeight: 800, fontSize: '0.75rem',
                          cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', transition: 'all 0.2s', opacity: 0.6
                        }}
                          onMouseOver={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.background = 'rgba(244,63,94,0.15)'; }}
                          onMouseOut={e => { e.currentTarget.style.opacity = '0.6'; e.currentTarget.style.background = 'rgba(244,63,94,0.05)'; }}
                        >
                          <Ban size={12} /> حظر
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', fontWeight: 700 }}>
            صفحة {page + 1} • {logs.length} سجل
          </span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} style={{
              padding: '0.5rem 1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              color: page === 0 ? 'rgba(255,255,255,0.2)' : '#fff', cursor: page === 0 ? 'not-allowed' : 'pointer', fontWeight: 800,
              display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem'
            }}>
              <ChevronRight size={14} /> السابق
            </button>
            <button onClick={() => setPage(page + 1)} disabled={!hasMore} style={{
              padding: '0.5rem 1rem', borderRadius: '8px', background: hasMore ? 'rgba(76,201,240,0.1)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${hasMore ? 'rgba(76,201,240,0.3)' : 'rgba(255,255,255,0.1)'}`,
              color: hasMore ? '#4cc9f0' : 'rgba(255,255,255,0.2)', cursor: hasMore ? 'pointer' : 'not-allowed', fontWeight: 800,
              display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem'
            }}>
              التالي <ChevronLeft size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
