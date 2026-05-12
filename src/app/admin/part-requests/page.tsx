"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, Wrench, Car, Phone, MapPin, Clock, CheckCircle2, XCircle, RefreshCw, AlertTriangle, MessageSquare } from 'lucide-react';

type PartRequest = {
  id: string;
  car_make: string;
  car_model: string;
  car_year: string;
  part_name: string;
  part_number?: string;
  customer_name: string;
  customer_phone: string;
  customer_city: string;
  user_id?: string;
  status?: string;
  admin_note?: string;
  created_at: string;
};

const statusOptions = ['جديد', 'قيد البحث', 'تم التواصل', 'تم الإيجاد', 'ملغي'];

const statusColor = (s: string) => {
  switch (s) {
    case 'جديد': return '#4cc9f0';
    case 'قيد البحث': return '#f59e0b';
    case 'تم التواصل': return '#b5179e';
    case 'تم الإيجاد': return '#10b981';
    case 'ملغي': return '#f43f5e';
    default: return 'rgba(255,255,255,0.4)';
  }
};

export default function AdminPartRequestsPage() {
  const [requests, setRequests] = useState<PartRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('الكل');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const fetchRequests = async () => {
    setRefreshing(true);
    try {
      const { data, error } = await supabase
        .from('part_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching part_requests:', error);
        // Try price_requests table as fallback
        const { data: data2 } = await supabase
          .from('price_requests')
          .select('*')
          .order('created_at', { ascending: false });
        if (data2) setRequests(data2 as PartRequest[]);
      } else if (data) {
        setRequests(data as PartRequest[]);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { fetchRequests(); }, []);

  // Realtime
  useEffect(() => {
    const channel = supabase
      .channel('admin-part-requests')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'part_requests' }, () => fetchRequests())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await supabase.from('part_requests').update({ status: newStatus }).eq('id', id);
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
    } catch (e) { console.error(e); }
  };

  const saveNote = async (id: string) => {
    const note = notes[id] || '';
    try {
      await supabase.from('part_requests').update({ admin_note: note }).eq('id', id);
      setRequests(prev => prev.map(r => r.id === id ? { ...r, admin_note: note } : r));
      alert('تم حفظ الملاحظة ✓');
    } catch (e) { console.error(e); }
  };

  const filtered = requests.filter(r => {
    const matchStatus = statusFilter === 'الكل' || (r.status || 'جديد') === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || 
      r.customer_name?.toLowerCase().includes(q) ||
      r.customer_phone?.includes(q) ||
      r.car_make?.toLowerCase().includes(q) ||
      r.car_model?.toLowerCase().includes(q) ||
      r.part_name?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const newCount = requests.filter(r => !r.status || r.status === 'جديد').length;

  return (
    <div style={{ color: '#fff', paddingBottom: '4rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 950, display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <Wrench size={32} color="#f59e0b" /> طلبات القطع
            {newCount > 0 && (
              <span style={{ background: '#f43f5e', color: '#fff', borderRadius: '20px', padding: '0.2rem 0.8rem', fontSize: '0.85rem', fontWeight: 800 }}>
                {newCount} جديد
              </span>
            )}
          </h1>
          <p style={{ margin: '0.3rem 0 0', color: 'rgba(255,255,255,0.4)', fontWeight: 700, fontSize: '0.95rem' }}>
            {requests.length} طلب إجمالي • {filtered.length} معروض
          </p>
        </div>
        <button onClick={fetchRequests} disabled={refreshing} style={{
          padding: '0.7rem 1.5rem', borderRadius: '12px', border: '1px solid rgba(245,158,11,0.3)',
          background: 'rgba(245,158,11,0.1)', color: '#f59e0b', fontWeight: 800,
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.3s',
        }}>
          <RefreshCw size={16} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} /> تحديث
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </button>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {statusOptions.map(s => {
          const count = requests.filter(r => (r.status || 'جديد') === s).length;
          return (
            <div key={s} onClick={() => setStatusFilter(statusFilter === s ? 'الكل' : s)}
              style={{
                background: 'rgba(10,10,15,0.6)', padding: '1rem 1.2rem', borderRadius: '14px',
                border: `1px solid ${statusColor(s)}30`, cursor: 'pointer', transition: 'all 0.2s',
                outline: statusFilter === s ? `2px solid ${statusColor(s)}` : 'none',
              }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 950, color: statusColor(s) }}>{count}</div>
              <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>{s}</div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div style={{
        background: 'rgba(10,10,15,0.6)', padding: '1rem 1.2rem', borderRadius: '14px',
        border: '1px solid rgba(255,255,255,0.06)', marginBottom: '1.5rem',
        display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap',
      }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <input type="text" placeholder="بحث بالاسم، الهاتف، السيارة، القطعة..."
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%', padding: '0.7rem 1rem', paddingRight: '2.5rem', borderRadius: '10px',
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              color: '#fff', fontSize: '0.88rem', outline: 'none', fontWeight: 600,
            }} />
          <Search size={16} color="rgba(255,255,255,0.3)" style={{ position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)' }} />
        </div>
        <div style={{ display: 'flex', gap: '0.3rem', background: 'rgba(0,0,0,0.4)', padding: '0.3rem', borderRadius: '10px', flexWrap: 'wrap' }}>
          {['الكل', ...statusOptions].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} style={{
              padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 800,
              cursor: 'pointer', border: 'none', transition: 'all 0.2s',
              background: statusFilter === s ? '#f59e0b' : 'transparent',
              color: statusFilter === s ? '#000' : 'rgba(255,255,255,0.5)',
            }}>{s}</button>
          ))}
        </div>
      </div>

      {/* Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'rgba(255,255,255,0.4)' }}>
          <Wrench size={40} color="#f59e0b" style={{ animation: 'pulse 2s infinite', marginBottom: '1rem' }} />
          <p>جارٍ تحميل الطلبات...</p>
          <style>{`@keyframes pulse { 0%,100%{opacity:0.4;transform:scale(0.95)} 50%{opacity:1;transform:scale(1.05)} }`}</style>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem 2rem', background: 'rgba(10,10,15,0.6)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <AlertTriangle size={48} color="rgba(255,255,255,0.2)" style={{ marginBottom: '1rem' }} />
          <p style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 800, fontSize: '1.1rem' }}>لا توجد طلبات مطابقة</p>
          {requests.length === 0 && (
            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
              لم يتم استلام أي طلب قطعة بعد
            </p>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filtered.map(req => {
            const isExpanded = expandedId === req.id;
            const status = req.status || 'جديد';
            return (
              <div key={req.id} style={{
                background: 'rgba(10,10,15,0.7)', borderRadius: '16px',
                border: `1px solid ${isExpanded ? statusColor(status) + '60' : 'rgba(255,255,255,0.06)'}`,
                overflow: 'hidden', transition: 'all 0.3s',
              }}>
                {/* Card Header */}
                <div onClick={() => setExpandedId(isExpanded ? null : req.id)}
                  style={{ padding: '1.2rem 1.5rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', flexWrap: 'wrap' }}>
                    {/* Car icon */}
                    <div style={{ background: 'rgba(245,158,11,0.1)', padding: '0.8rem', borderRadius: '12px', color: '#f59e0b', flexShrink: 0 }}>
                      <Car size={22} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 900, fontSize: '1rem', color: '#fff', marginBottom: '0.3rem' }}>
                        {req.car_make} {req.car_model} {req.car_year}
                      </div>
                      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', color: 'rgba(255,255,255,0.5)', fontSize: '0.83rem', fontWeight: 700 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Wrench size={13} /> {req.part_name}</span>
                        {req.part_number && <span style={{ color: '#4cc9f0', fontFamily: 'monospace' }}>#{req.part_number}</span>}
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><MapPin size={13} /> {req.customer_city}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Phone size={13} /> <span dir="ltr">{req.customer_phone}</span></span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>
                        {new Date(req.created_at).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' })}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.2)', fontWeight: 600 }}>
                        {new Date(req.created_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <span style={{
                      padding: '0.35rem 0.9rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 900,
                      background: `${statusColor(status)}15`, color: statusColor(status),
                      border: `1px solid ${statusColor(status)}40`,
                    }}>
                      {status}
                    </span>
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '50%',
                      background: isExpanded ? '#f59e0b' : 'rgba(255,255,255,0.05)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s',
                    }}>
                      {isExpanded 
                        ? <span style={{ color: '#000', fontSize: '1rem', fontWeight: 900 }}>↑</span>
                        : <span style={{ fontSize: '1rem', fontWeight: 900 }}>↓</span>
                      }
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem' }}>
                    {/* Customer Info */}
                    <div>
                      <h4 style={{ margin: '0 0 1rem', color: '#4cc9f0', fontWeight: 900, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Phone size={16} /> بيانات العميل
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem', fontSize: '0.9rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', color: 'rgba(255,255,255,0.7)' }}>
                          <span style={{ color: 'rgba(255,255,255,0.35)', width: '60px', fontWeight: 700, fontSize: '0.82rem' }}>الاسم:</span>
                          <span style={{ fontWeight: 800, color: '#fff' }}>{req.customer_name}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', color: 'rgba(255,255,255,0.7)' }}>
                          <span style={{ color: 'rgba(255,255,255,0.35)', width: '60px', fontWeight: 700, fontSize: '0.82rem' }}>الهاتف:</span>
                          <a href={`tel:${req.customer_phone}`} style={{ fontWeight: 800, color: '#10b981', textDecoration: 'none', direction: 'ltr' }}>{req.customer_phone}</a>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                          <span style={{ color: 'rgba(255,255,255,0.35)', width: '60px', fontWeight: 700, fontSize: '0.82rem' }}>المدينة:</span>
                          <span style={{ fontWeight: 800, color: '#fff' }}>{req.customer_city}</span>
                        </div>
                        {/* WhatsApp Button */}
                        <a href={`https://wa.me/966${req.customer_phone?.replace(/^0/, '')}`} target="_blank" rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.6rem 1.2rem', background: '#25D366', color: '#fff',
                            borderRadius: '10px', fontWeight: 800, fontSize: '0.85rem', textDecoration: 'none',
                            marginTop: '0.5rem', width: 'fit-content', boxShadow: '0 4px 15px rgba(37,211,102,0.2)',
                          }}>
                          <MessageSquare size={16} /> تواصل واتساب
                        </a>
                      </div>
                    </div>

                    {/* Part Details */}
                    <div>
                      <h4 style={{ margin: '0 0 1rem', color: '#f59e0b', fontWeight: 900, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Wrench size={16} /> تفاصيل القطعة
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem', fontSize: '0.9rem' }}>
                        <div style={{ display: 'flex', gap: '0.7rem' }}>
                          <span style={{ color: 'rgba(255,255,255,0.35)', width: '70px', fontWeight: 700, fontSize: '0.82rem', flexShrink: 0 }}>السيارة:</span>
                          <span style={{ fontWeight: 800, color: '#fff' }}>{req.car_make} {req.car_model} {req.car_year}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.7rem' }}>
                          <span style={{ color: 'rgba(255,255,255,0.35)', width: '70px', fontWeight: 700, fontSize: '0.82rem', flexShrink: 0 }}>القطعة:</span>
                          <span style={{ fontWeight: 800, color: '#f59e0b' }}>{req.part_name}</span>
                        </div>
                        {req.part_number && (
                          <div style={{ display: 'flex', gap: '0.7rem' }}>
                            <span style={{ color: 'rgba(255,255,255,0.35)', width: '70px', fontWeight: 700, fontSize: '0.82rem', flexShrink: 0 }}>رقم OEM:</span>
                            <span style={{ fontWeight: 900, color: '#4cc9f0', fontFamily: 'monospace' }}>{req.part_number}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status Change */}
                    <div>
                      <h4 style={{ margin: '0 0 1rem', color: '#10b981', fontWeight: 900, fontSize: '0.95rem' }}>تحديث الحالة</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem' }}>
                        {statusOptions.map(s => (
                          <button key={s} onClick={() => updateStatus(req.id, s)}
                            style={{
                              padding: '0.6rem 1rem', borderRadius: '8px', fontSize: '0.83rem', fontWeight: 800,
                              cursor: 'pointer', transition: 'all 0.2s', textAlign: 'right',
                              border: `1px solid ${status === s ? statusColor(s) : 'rgba(255,255,255,0.08)'}`,
                              background: status === s ? `${statusColor(s)}20` : 'rgba(255,255,255,0.02)',
                              color: status === s ? statusColor(s) : 'rgba(255,255,255,0.5)',
                              display: 'flex', alignItems: 'center', gap: '0.5rem',
                            }}>
                            {status === s && <CheckCircle2 size={14} />} {s}
                          </button>
                        ))}
                      </div>
                      {/* Admin Note */}
                      <div>
                        <label style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)', fontWeight: 700, marginBottom: '0.4rem', display: 'block' }}>ملاحظة داخلية:</label>
                        <textarea
                          rows={3}
                          value={notes[req.id] ?? req.admin_note ?? ''}
                          onChange={e => setNotes(prev => ({ ...prev, [req.id]: e.target.value }))}
                          placeholder="مثال: تواصلت مع المورد، السعر 350 ر.س..."
                          style={{
                            width: '100%', padding: '0.7rem', borderRadius: '10px', resize: 'vertical',
                            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                            color: '#fff', fontSize: '0.85rem', outline: 'none', fontFamily: 'inherit',
                          }}
                        />
                        <button onClick={() => saveNote(req.id)}
                          style={{
                            marginTop: '0.5rem', padding: '0.5rem 1.2rem', background: 'rgba(16,185,129,0.1)',
                            border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', borderRadius: '8px',
                            fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer',
                          }}>
                          حفظ الملاحظة ✓
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
