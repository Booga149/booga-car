"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, Download, Table } from 'lucide-react';

export default function AdminImport() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [baseUrl, setBaseUrl] = useState('');
  const [logs, setLogs] = useState<{ type: 'success' | 'error'; message: string }[]>([]);
  const [makesMap, setMakesMap] = useState<Record<string, string>>({});
  const [modelsMap, setModelsMap] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadMetadata() {
      const { data: makes } = await supabase.from('car_makes').select('id, name');
      const { data: models } = await supabase.from('car_models').select('id, name');
      
      const mks: Record<string, string> = {};
      makes?.forEach(m => mks[m.name.toLowerCase()] = m.id);
      
      const mdls: Record<string, string> = {};
      models?.forEach(m => mdls[m.name.toLowerCase()] = m.id);
      
      setMakesMap(mks);
      setModelsMap(mdls);
    }
    loadMetadata();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFile(e.target.files[0]);
  };

  const parseCSV = (text: string) => {
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    return lines.slice(1).filter(l => l.trim()).map(line => {
      const values = line.split(',').map(v => v.trim());
      const obj: any = {};
      headers.forEach((h, i) => obj[h] = values[i]);
      return obj;
    });
  };

  const startImport = async () => {
    if (!file) return;
    setIsUploading(true);
    setLogs([{ type: 'success', message: 'جاري بدء عملية الاستيراد...' }]);

    try {
      const text = await file.text();
      const products = parseCSV(text);
      let successCount = 0;
      let errorCount = 0;

      for (const p of products) {
        try {
          // Validation
          if (!p.name || !p.price) {
            setLogs(prev => [...prev, { type: 'error', message: `فشل استيراد: ${p.name || 'غير معروف'} - بيانات ناقصة.` }]);
            errorCount++;
            continue;
          }

          const make_id = makesMap[p.make?.toLowerCase()] || null;
          const model_id = modelsMap[p.model?.toLowerCase()] || null;

          let image_url = p.image_url || null;
          if (image_url && baseUrl && !image_url.startsWith('http')) {
            image_url = baseUrl.endsWith('/') ? `${baseUrl}${image_url}` : `${baseUrl}/${image_url}`;
          }

          const { error } = await supabase.from('products').insert({
            name: p.name,
            brand: p.brand || '',
            category: p.category || 'أخرى',
            price: parseFloat(p.price),
            old_price: p.old_price ? parseFloat(p.old_price) : null,
            image_url,
            part_number: p.part_number || null,
            make_id,
            model_id,
            condition: p.condition === 'مستعمل' ? 'مستعمل' : 'جديد',
            stock: p.stock === 'غير متوفر' ? 'غير متوفر' : 'متوفر',
          });

          if (error) throw error;
          successCount++;
        } catch (err: any) {
          errorCount++;
          setLogs(prev => [...prev, { type: 'error', message: `خطأ في ${p.name}: ${err.message}` }]);
        }
      }

      setLogs(prev => [...prev, { type: 'success', message: `تمت العملية بنجاح! تم استيراد ${successCount} منتج، وفشل ${errorCount}.` }]);
    } catch (e: any) {
      setLogs(prev => [...prev, { type: 'error', message: 'خطأ فني في قراءة الملف.' }]);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px', padding: '2rem' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: '0.5rem' }}>استيراد المنتجات (CSV)</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          ارفع ملفات الشركات الكبرى بضغطة واحدة. تأكد من توافق الملف مع النموذج المطلوب.
        </p>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <label style={{ display: 'block', fontWeight: 800, marginBottom: '0.8rem', fontSize: '1.1rem' }}>
          رابط الصور الأساسي (اختياري)
        </label>
        <input 
          type="text" 
          placeholder="مثال: https://my-parts-site.com/images/" 
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
          style={{ 
            width: '100%', padding: '1.2rem', borderRadius: '14px', border: '1px solid var(--border)',
            background: 'var(--surface)', color: 'var(--text-primary)', outline: 'none', fontSize: '1rem'
          }}
        />
        <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          إذا وضعت رابطاً هنا، سيتم إضافته قبل أي اسم صورة في ملف CSV (مثلاً: logo.jpg يصبح https://site.com/logo.jpg)
        </p>
      </div>

      <div style={{ 
        background: 'var(--surface)', border: '2px dashed var(--border)', borderRadius: '24px',
        padding: '4rem 2rem', textAlign: 'center', transition: '0.3s',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem',
        cursor: 'pointer'
      }} onMouseOver={e=>e.currentTarget.style.borderColor='var(--primary)'} onMouseOut={e=>e.currentTarget.style.borderColor='var(--border)'}>
        <div style={{ background: 'rgba(244, 63, 94, 0.08)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Upload size={40} color="var(--primary)" />
        </div>
        <div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem' }}>اختر ملف CSV للرفع</h3>
          <p style={{ color: 'var(--text-secondary)' }}>أقصى حجم للملف 10 ميجابايت (مليون منتج تقريباً)</p>
        </div>
        <input type="file" accept=".csv" onChange={handleFileChange} style={{ display: 'none' }} id="csv-upload" />
        <label htmlFor="csv-upload" style={{ 
          background: 'var(--primary)', color: 'white', padding: '1rem 3rem', borderRadius: '14px', 
          fontWeight: 900, fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 8px 25px rgba(244, 63, 94, 0.3)'
        }}>
          تصفح الملفات
        </label>
        {file && <div style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)' }}><FileText size={20} /> {file.name}</div>}
      </div>

      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
        <button 
          onClick={startImport} 
          disabled={!file || isUploading}
          style={{ 
            flex: 1, padding: '1.2rem', background: isUploading ? '#ccc' : 'var(--text-primary)', color: 'white', 
            border: 'none', borderRadius: '16px', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem'
          }}
        >
          {isUploading ? <Loader2 size={24} className="animate-spin" /> : <Table size={24} />}
          {isUploading ? 'جاري الاستيراد...' : 'بدء عملية الرفع الآن'}
        </button>
        <button style={{ padding: '1.2rem', background: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: '16px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Download size={20} /> تحميل قالب Excel
        </button>
      </div>

      {logs.length > 0 && (
        <div style={{ 
          marginTop: '3rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px', padding: '1.5rem'
        }}>
          <h4 style={{ marginBottom: '1.5rem', fontWeight: 900, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Loader2 size={20} className={isUploading ? "animate-spin" : ""} /> سجل العمليات الآني
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
            {logs.map((log, i) => (
              <div key={i} style={{ 
                padding: '1rem', borderRadius: '12px', background: 'var(--background)',
                display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.95rem',
                borderLeft: `4px solid ${log.type === 'success' ? 'var(--success)' : 'var(--error)'}`
              }}>
                {log.type === 'success' ? <CheckCircle2 size={18} color="var(--success)" /> : <AlertCircle size={18} color="var(--error)" />}
                <span style={{ fontWeight: 600 }}>{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
