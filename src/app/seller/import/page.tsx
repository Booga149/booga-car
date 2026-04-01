"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { processRow, mapHeader } from '@/utils/smartImport';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Download, 
  Table, 
  ChevronRight,
  Sparkles,
  ArrowRight,
  Database,
  Search,
  Image as ImageIcon,
  Zap,
  ChevronDown
} from 'lucide-react';

// Dynamic import for XLSX to avoid build issues if not installed yet
let XLSX: any;
try {
  XLSX = require('xlsx');
} catch (e) {
  console.warn("XLSX library not found. Excel support disabled.");
}

export default function MerchantImportPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [mode, setMode] = useState<'csv' | 'images'>('csv');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [step, setStep] = useState(1);
  const [imageLogs, setImageLogs] = useState<{name: string, status: 'success' | 'error' | 'pending', message?: string}[]>([]);
  
  // CSV Import State
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [rawData, setRawData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [logs, setLogs] = useState<{ type: 'success' | 'error'; message: string }[]>([]);
  const [baseUrl, setBaseUrl] = useState('');
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState({ total: 0, success: 0, failed: 0 });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !user) return;
    const files = Array.from(e.target.files);
    setIsUploading(true);
    setImageLogs(files.map(f => ({ name: f.name, status: 'pending' })));

    let successCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const partNumber = file.name.split('.')[0]; // e.g., "KYB-123.jpg" -> "KYB-123"
      
      try {
        // 0. Validate File Type
        if (!file.type.startsWith('image/')) {
          setImageLogs(prev => prev.map((log, idx) => 
            idx === i ? { ...log, status: 'error', message: 'هذا الملف ليس صورة. يرجى رفع صور فقط هنا.' } : log
          ));
          continue;
        }

        // 1. Upload to Supabase Storage
        // Sanitize filename to avoid "Invalid Key" errors with non-ASCII chars
        const fileExt = file.name.split('.').pop();
        const safeName = `${Date.now()}-${i}.${fileExt}`;
        const fileName = `${user.id}/${safeName}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${uploadData.path}`;

        // 2. Update Product table
        const { data: updateData, error: updateError } = await supabase
          .from('products')
          .update({ image_url: imageUrl })
          .eq('part_number', partNumber)
          .eq('seller_id', user.id)
          .select();

        if (updateError) throw updateError;

        if (updateData && updateData.length > 0) {
          setImageLogs(prev => prev.map((log, idx) => 
            idx === i ? { ...log, status: 'success', message: `تم الربط بـ ${updateData[0].name}` } : log
          ));
          successCount++;
        } else {
          setImageLogs(prev => prev.map((log, idx) => 
            idx === i ? { ...log, status: 'error', message: 'لم يتم العثور على منتج بهذا الرقم' } : log
          ));
        }
      } catch (err: any) {
        setImageLogs(prev => prev.map((log, idx) => 
          idx === i ? { ...log, status: 'error', message: err.message } : log
        ));
      }
    }

    addToast(`اكتملت العملية: تم ربط ${successCount} صورة بنجاح`, "success");
    setIsUploading(false);
  };

  const internalFields = [
    { key: 'name', label: 'اسم المنتج' },
    { key: 'price', label: 'السعر' },
    { key: 'brand', label: 'الماركة/الشركة' },
    { key: 'category', label: 'القسم/الفئة' },
    { key: 'image_url', label: 'رابط الصورة' },
    { key: 'part_number', label: 'رقم القطعة' },
    { key: 'condition', label: 'الحالة (جديد/مستعمل)' },
    { key: 'stock', label: 'المخزون' },
    { key: 'old_price', label: 'السعر القديم (للخصم)' },
    { key: 'description', label: 'الوصف التفصيلي' }
  ];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setStep(2); 
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result;
        let pArray: any[] = [];
        let fileHeaders: string[] = [];

        if (typeof content === 'string') {
          // CSV Parsing with improved handling for commas in quotes
          const rows = content.split('\n').filter(r => r.trim());
          if (rows.length > 0) {
            fileHeaders = rows[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
            pArray = rows.slice(1).map(row => {
              const values = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || row.split(',');
              const obj: any = {};
              fileHeaders.forEach((h, i) => obj[h] = (values[i] || '').replace(/^["']|["']$/g, ''));
              return obj;
            });
          }
        } else if (content instanceof ArrayBuffer && XLSX) {
          // Excel Parsing
          const workbook = XLSX.read(new Uint8Array(content), { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          pArray = XLSX.utils.sheet_to_json(firstSheet);
          if (pArray.length > 0) {
            fileHeaders = Object.keys(pArray[0]);
          }
        }

        setRawData(pArray);
        setHeaders(fileHeaders);
        
        // Initial Auto-Mapping
        const initialMapping: Record<string, string> = {};
        fileHeaders.forEach(h => {
          const matched = mapHeader(h);
          if (matched) initialMapping[h] = matched;
        });
        setMapping(initialMapping);
        
        // Initial Preview Data
        const preview = pArray.slice(0, 5).map(row => {
          const mappedRow: any = {};
          Object.entries(mapping).forEach(([h, key]) => {
            mappedRow[key] = row[h];
          });
          return processRow(row); // Initial smart process
        });
        setPreviewData(preview);
      };

      if (selectedFile.name.endsWith('.csv')) {
        reader.readAsText(selectedFile);
      } else if (XLSX) {
        reader.readAsArrayBuffer(selectedFile);
      } else {
        addToast("دعم الإكسيل معطل حالياً. يرجى استخدام ملف CSV.", "error");
      }
    }
  };

  const startImport = async () => {
    if (!file || !user) return;

    // ── Validation: part_number required for all products ──
    // Re-detect mapping fresh at import time (applies any latest fixes to mapHeader)
    const freshMapping: Record<string, string> = {};
    headers.forEach(h => {
      const matched = mapHeader(h);
      if (matched) freshMapping[h] = matched;
      else if (mapping[h]) freshMapping[h] = mapping[h]; // fallback to user-set mapping
    });

    const rowsProcessed = rawData.map(row => {
      const mappedRow: any = {};
      headers.forEach(h => { if (freshMapping[h]) mappedRow[freshMapping[h]] = row[h]; });
      return { raw: row, processed: processRow(mappedRow) };
    });
    const missing = rowsProcessed.filter(r => !r.processed.part_number || r.processed.part_number.trim() === '');
    // Warn about missing part numbers but don't block — auto-generate for those rows
    if (missing.length > 0) {
      const names = missing.slice(0, 3).map(r => r.processed.name).join('، ');
      addToast(`⚠️ ${missing.length} منتج ليس له رقم قطعة — سيتم توليد رقم تلقائي`, 'error');
    }

    setIsUploading(true);
    setStep(3);
    setLogs([{ type: 'success', message: 'جاري البدء في معالجة البيانات وبدء الرفع...' }]);

    try {
      const finalInserts = rowsProcessed.map(({ processed }) => {
        const p = processed;
        const resolveUrl = (url: string | undefined) =>
          url && url.trim() ? (baseUrl ? `${baseUrl}/${url}`.replace(/([^:]\/)\/+/g, '$1') : url) : null;
        const allImages = (p.images || []).map(resolveUrl).filter((u): u is string => Boolean(u));

        return {
          name: p.name,
          brand: p.brand || 'غير محدد',
          category: p.category,
          price: p.price,
          old_price: p.old_price || null,
          image_url: allImages[0] || null,
          images: allImages,
          part_number: (p.part_number && (p.part_number as string).trim() !== '')
            ? (p.part_number as string).trim()
            : `AUTO-${Date.now()}-${Math.random().toString(36).substring(2,6)}`,
          condition: p.condition,
          stock: p.stock,
          stock_quantity: p.stock === 'متوفر' ? 10 : 0,
          seller_id: user!.id,
          is_active: true,
          description: p.description || null
        };
      });

      setStats({ total: finalInserts.length, success: 0, failed: 0 });

      // Bulk UPSERT in chunks
      const chunkSize = 50;
      let successCount = 0;
      let failedCount = 0;

      for (let i = 0; i < finalInserts.length; i += chunkSize) {
        const chunk = finalInserts.slice(i, i + chunkSize);
        
        // Smart Upsert: Matches on (part_number, seller_id) — same seller can't have same part number twice
        const { error } = await supabase
          .from('products')
          .upsert(chunk, { onConflict: 'part_number,seller_id' });
        
        if (error) {
          failedCount += chunk.length;
          setLogs(prev => [...prev, { type: 'error', message: `خطأ في المجموعة (${i}-${i+chunkSize}): ${error.message}` }]);
        } else {
          successCount += chunk.length;
          setLogs(prev => [...prev, { type: 'success', message: `تمت معالجة ${Math.min(i + chunkSize, finalInserts.length)} منتج...` }]);
        }
        
        const currentProgress = Math.round(((i + chunk.length) / finalInserts.length) * 100);
        setProgress(currentProgress);
        setStats(prev => ({ ...prev, success: successCount, failed: failedCount }));
      }

      setLogs(prev => [...prev, { type: 'success', message: `اكتملت العملية! تم رفع ${successCount} منتج بنجاح، وفشل ${failedCount} منتج.` }]);
      addToast(`تم استيراد ${successCount} منتج بنجاح`, successCount > 0 ? "success" : "error");
      setIsUploading(false);

    } catch (e: any) {
      setLogs(prev => [...prev, { type: 'error', message: `خطأ غير متوقع: ${e.message}` }]);
      setIsUploading(false);
    }
  };

  return (
    <main style={{ minHeight: '100vh', background: 'var(--background)' }}>
      <Navbar />
      
      <div style={{ padding: '8rem 1.5rem 4rem', maxWidth: '1000px', margin: '0 auto' }}>
        <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
          <div style={{ 
            display: 'inline-flex', alignItems: 'center', gap: '0.6rem', 
            background: 'rgba(244, 63, 94, 0.1)', color: 'var(--primary)', 
            padding: '0.6rem 1.2rem', borderRadius: '40px', fontWeight: 800, fontSize: '0.9rem',
            marginBottom: '1rem'
          }}>
            <Sparkles size={18} /> الرفع الذكي للمخزون
          </div>
          <h1 style={{ fontSize: '2.8rem', fontWeight: 950, marginBottom: '1rem' }}>ارفع ملفك.. واترك الباقي علينا</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '700px', margin: '0 auto', marginBottom: '2rem' }}>
            لا حاجة لتعديل ملفك يدوياً. نظامنا الذكي يتعرف على الأعمدة ويصنف المنتجات تلقائياً في الأقسام الصحيحة.
          </p>
          
          <button 
            onClick={() => {
              const headers = "رقم القطعة *,اسم المنتج *,السعر *,الماركة,القسم,الحالة,الكمية,الوصف,صورة 1,صورة 2,صورة 3\n";
              const sample = "KYB-55126,مساعد أمامي يميني,450,KYB,المساعدات والمقصات,جديد,10,مساعد أمامي يلائم كامري 2018-2022,https://example.com/img1.jpg,https://example.com/img2.jpg,https://example.com/img3.jpg";
              const note = "\n\n# ملاحظة: الأعمدة التي تحمل * إجبارية. يمكنك إضافة صورة 4 بنفس الطريقة.";
              const blob = new Blob([headers + sample + note], { type: 'text/csv;charset=utf-8;' });
              const link = document.createElement("a");
              link.href = URL.createObjectURL(blob);
              link.download = "booga_template.csv";
              link.click();
            }}
            style={{ 
              display: 'inline-flex', alignItems: 'center', gap: '0.6rem', padding: '0.8rem 1.5rem', 
              borderRadius: '16px', background: 'var(--surface)', border: '1px solid var(--border)',
              color: 'var(--text-primary)', fontWeight: 800, cursor: 'pointer', transition: '0.3s'
            }}
            onMouseOver={e=>e.currentTarget.style.borderColor='var(--primary)'}
            onMouseOut={e=>e.currentTarget.style.borderColor='var(--border)'}
          >
            <Download size={20} color="var(--primary)" /> تحميل نموذج للملف
          </button>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
            <button 
              onClick={() => setMode('csv')}
              style={{ 
                padding: '0.8rem 2rem', borderRadius: '14px', fontWeight: 800, cursor: 'pointer',
                background: mode === 'csv' ? 'var(--primary)' : 'var(--surface)',
                color: mode === 'csv' ? 'white' : 'var(--text-secondary)',
                border: mode === 'csv' ? 'none' : '1px solid var(--border)',
                display: 'flex', alignItems: 'center', gap: '0.6rem', transition: '0.3s'
              }}
            >
              <FileText size={18} /> الخطوة (1): رفع البيانات (Excel)
            </button>
            <button 
              onClick={() => setMode('images')}
              style={{ 
                padding: '0.8rem 2rem', borderRadius: '14px', fontWeight: 800, cursor: 'pointer',
                background: mode === 'images' ? 'var(--primary)' : 'var(--surface)',
                color: mode === 'images' ? 'white' : 'var(--text-secondary)',
                border: mode === 'images' ? 'none' : '1px solid var(--border)',
                display: 'flex', alignItems: 'center', gap: '0.6rem', transition: '0.3s'
              }}
            >
              <ImageIcon size={18} /> الخطوة (2): رفع صور المنتجات
            </button>
          </div>
        </header>

        {mode === 'csv' ? (
          <>
            {/* Steps Progress */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '3rem' }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{ 
              flex: 1, height: '6px', borderRadius: '3px',
              background: step >= s ? 'var(--primary)' : 'var(--border)',
              transition: '0.5s'
            }} />
          ))}
        </div>

        {step === 1 && (
          <div className="glass-panel" style={{ 
            padding: '4rem 2rem', borderRadius: '32px', textAlign: 'center',
            border: '2px dashed var(--border)', background: 'var(--surface)',
            cursor: 'pointer', transition: '0.3s'
          }} onMouseOver={e=>e.currentTarget.style.borderColor='var(--primary)'} onMouseOut={e=>e.currentTarget.style.borderColor='var(--border)'}>
            <input type="file" id="file-upload" style={{ display: 'none' }} accept=".csv, .xlsx, .xls" onChange={handleFileChange} />
            <label htmlFor="file-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ 
                width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(244, 63, 94, 0.05)',
                display: 'flex', alignItems: 'center', justifyContent: 'center' 
              }}>
                <Upload size={50} color="var(--primary)" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>اختر ملف الإكسيل أو CSV</h3>
                <p style={{ color: 'var(--text-secondary)' }}>تأكد أن الملف يحتوي على أسماء المنتجات وأسعارها على الأقل</p>
              </div>
              <div style={{ 
                background: 'var(--primary)', color: 'white', padding: '1rem 3rem', borderRadius: '16px',
                fontWeight: 900, fontSize: '1.1rem', boxShadow: '0 8px 25px rgba(244, 63, 94, 0.3)'
              }}>تصفح الملفات</div>
            </label>
          </div>
        )}

        {step === 2 && (
          <div className="glass-panel" style={{ padding: '3rem', borderRadius: '32px', background: 'var(--surface)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 950, display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <Search size={28} color="var(--primary)" /> مراجعة ومطابقة البيانات
              </h3>
              <div style={{ textAlign: 'left' }}>
                <p style={{ margin: 0, fontWeight: 800 }}>{file?.name}</p>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{rawData.length} منتج تم العثور عليه</p>
              </div>
            </div>

            {/* ✅ Auto-Detection Summary — replaces manual column mapping */}
            <div style={{ 
              background: 'rgba(16,185,129,0.04)', borderRadius: '24px', 
              padding: '2rem', marginBottom: '2.5rem', border: '1px solid rgba(16,185,129,0.15)' 
            }}>
              <h4 style={{ marginBottom: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981' }}>
                <Sparkles size={20} /> تم التعرف التلقائي على الأعمدة
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
                {headers.map((h, i) => {
                  const mapped = mapping[h];
                  const fieldLabel = internalFields.find(f => f.key === mapped)?.label;
                  return (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: '0.8rem',
                      padding: '0.9rem 1.2rem', borderRadius: '14px',
                      background: mapped ? 'rgba(16,185,129,0.07)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${mapped ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)'}`,
                    }}>
                      <div style={{
                        width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0,
                        background: mapped ? '#10b981' : 'rgba(255,255,255,0.15)',
                        boxShadow: mapped ? '0 0 6px rgba(16,185,129,0.6)' : 'none'
                      }} />
                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', fontWeight: 700, marginBottom: '2px' }}>{h}</div>
                        <div style={{ fontWeight: 800, fontSize: '0.9rem', color: mapped ? '#10b981' : 'rgba(255,255,255,0.3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {mapped ? `→ ${fieldLabel}` : '— متجاهل —'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {Object.keys(mapping).length === 0 && (
                <div style={{ marginTop: '1rem', padding: '1rem', borderRadius: '12px', background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.15)', color: '#f43f5e', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <AlertCircle size={18} /> لم يتم التعرف على أي عمود — تأكد أن الملف يحتوي على أسماء مثل "اسم المنتج", "السعر", "رقم القطعة"
                </div>
              )}
            </div>


            <div style={{ overflowX: 'auto', marginBottom: '3rem' }}>
              <h4 style={{ marginBottom: '1rem', fontWeight: 800 }}>معاينة أول 5 منتجات</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
                <thead>
                  <tr style={{ background: 'rgba(0,0,0,0.05)', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    <th style={{ padding: '1rem' }}>الاسم</th>
                    <th style={{ padding: '1rem' }}>السعر</th>
                    <th style={{ padding: '1rem' }}>التصنيف الذكي</th>
                    <th style={{ padding: '1rem' }}>رقم القطعة</th>
                  </tr>
                </thead>
                <tbody>
                  {rawData.slice(0, 5).map((row, i) => {
                    const preview = processRow({...row, ...Object.fromEntries(Object.entries(mapping).map(([h, k]) => [k, row[h]]))});
                    return (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '1.2rem', fontWeight: 800 }}>{preview.name}</td>
                        <td style={{ padding: '1.2rem', color: 'var(--primary)', fontWeight: 900 }}>{preview.price} ر.س</td>
                        <td style={{ padding: '1.2rem' }}>
                          <span style={{ 
                            padding: '0.4rem 0.8rem', borderRadius: '20px', background: 'rgba(244, 63, 94, 0.05)',
                            color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 800
                          }}>{preview.category}</span>
                        </td>
                        <td style={{ padding: '1.2rem', color: 'var(--text-secondary)' }}>{preview.part_number || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div style={{ marginBottom: '3rem' }}>
              <label style={{ display: 'block', fontWeight: 800, marginBottom: '0.8rem' }}>رابط الصور الأساسي (اختياري)</label>
              <input 
                type="text" 
                placeholder="مثال: https://mystore.com/images/" 
                value={baseUrl}
                onChange={e => setBaseUrl(e.target.value)}
                style={{ 
                  width: '100%', padding: '1.2rem', background: 'var(--background)',
                  border: '1px solid var(--border)', borderRadius: '14px', color: 'var(--text-primary)'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <button 
                onClick={() => setStep(1)}
                style={{ 
                  flex: 1, padding: '1.4rem', background: 'transparent', color: 'var(--text-primary)',
                  border: '1px solid var(--border)', borderRadius: '18px', fontWeight: 800, cursor: 'pointer'
                }}
              >تغيير الملف</button>
              <button 
                onClick={startImport}
                style={{ 
                  flex: 2, padding: '1.4rem', background: 'var(--primary)', color: 'white',
                  border: 'none', borderRadius: '18px', fontWeight: 950, fontSize: '1.2rem',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem',
                  boxShadow: '0 8px 30px rgba(244, 63, 94, 0.4)'
                }}
              >تأكيد وبدء الرفع <Database size={22} /></button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="glass-panel" style={{ padding: '4rem', borderRadius: '32px', background: 'var(--surface)' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 2rem' }}>
                 <div style={{ 
                    position: 'absolute', inset: 0, borderRadius: '50%', 
                    border: '8px solid var(--border)', borderTopColor: 'var(--primary)',
                    animation: isUploading ? 'spin 2s linear infinite' : 'none',
                    transform: `rotate(${progress * 3.6}deg)`
                 }}></div>
                 <div style={{ 
                    position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)'
                 }}>
                    {progress}%
                 </div>
              </div>
              <h3 style={{ fontSize: '2rem', fontWeight: 950 }}>{isUploading ? 'جاري معالجة مخزنك...' : 'اكتملت العملية!'}</h3>
              {!isUploading && (
                <p style={{ marginTop: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  تم رفع {stats.success} من {stats.total} منتج بنجاح.
                </p>
              )}
            </div>

            <div style={{ background: 'var(--background)', borderRadius: '24px', padding: '2rem', border: '1px solid var(--border)' }}>
              <h4 style={{ fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Table size={20} color="var(--primary)" /> سجل العمليات التفصيلي
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '300px', overflowY: 'auto', paddingRight: '1rem' }}>
                {logs.map((log, i) => (
                  <div key={i} style={{ 
                    padding: '1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.02)',
                    display: 'flex', alignItems: 'center', gap: '1rem', borderRight: `4px solid ${log.type === 'success' ? '#10b981' : '#f43f5e'}`,
                    animation: 'fadeIn 0.3s ease forwards'
                  }}>
                    {log.type === 'success' ? <CheckCircle2 size={18} color="#10b981" /> : <AlertCircle size={18} color="#f43f5e" />}
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{log.message}</span>
                  </div>
                ))}
                {isUploading && <div style={{ textAlign: 'center', padding: '1rem', opacity: 0.5 }} className="animate-pulse">بانتظار اكمال المجموعة التالية...</div>}
              </div>
            </div>

            {!isUploading && (
              <div style={{ marginTop: '3rem', textAlign: 'center' }}>
                <button 
                  onClick={() => window.location.href = '/seller/dashboard'}
                  style={{ 
                    background: 'var(--primary)', color: 'white', padding: '1.2rem 4rem', borderRadius: '18px',
                    fontWeight: 950, fontSize: '1.2rem', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '0.8rem', margin: '0 auto'
                  }}
                >العودة للوحة التحكم <ArrowRight size={22} /></button>
              </div>
            )}
          </div>
            )}
          </>
        ) : (
          <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div className="glass-panel" style={{ 
              padding: '4rem 2rem', borderRadius: '32px', textAlign: 'center',
              border: '2px dashed var(--border)', background: 'var(--surface)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2.5rem'
            }}>
              <div style={{ 
                width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(244, 63, 94, 0.1)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <ImageIcon size={50} color="var(--primary)" />
              </div>
              <div>
                <h2 style={{ fontSize: '2.2rem', fontWeight: 950, marginBottom: '1rem' }}>الربط الذكي للصور بالرقم المصنعي</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.15rem', maxWidth: '600px', margin: '0 auto', fontWeight: 600, lineHeight: 1.6 }}>
                  ارفع مجموعة من الصور، وسيقوم النظام فوراً بمطابقتها مع منتجاتك بناءً على **اسم الملف** (يجب أن يكون اسم الصورة هو نفس رقم القطعة).
                </p>
              </div>

              <div style={{ width: '100%', maxWidth: '500px' }}>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  id="image-mapper" 
                  style={{ display: 'none' }}
                  onChange={handleImageUpload}
                  disabled={isUploading}
                />
                <label htmlFor="image-mapper" style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem',
                  padding: '1.4rem', borderRadius: '18px', background: isUploading ? 'var(--border)' : 'var(--primary)',
                  color: 'white', fontWeight: 950, fontSize: '1.1rem', cursor: isUploading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 8px 25px rgba(244, 63, 94, 0.3)', transition: '0.3s'
                }}>
                  {isUploading ? <Loader2 size={24} className="animate-spin" /> : <Upload size={24} />}
                  {isUploading ? 'جاري معالجة الصور...' : 'اختر الصور للمطابقة الآن'}
                </label>
                <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>يُفضل أن لا يتجاوز حجم الصورة الواحدة 2 ميجابايت.</p>
              </div>
            </div>

            {imageLogs.length > 0 && (
              <div style={{ marginTop: '3rem', animation: 'fadeIn 0.5s ease-out' }}>
                <h4 style={{ fontWeight: 950, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.3rem' }}>
                  <Database size={24} color="var(--primary)" /> سجل مطابقة الصور ({imageLogs.length})
                </h4>
                <div style={{ 
                  display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                  gap: '1rem', maxHeight: '500px', overflowY: 'auto', paddingRight: '1rem' 
                }}>
                  {imageLogs.map((log, i) => (
                    <div key={i} style={{ 
                      padding: '1rem', borderRadius: '16px', background: 'var(--surface)',
                      border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem',
                      borderRight: `5px solid ${log.status === 'success' ? '#10b981' : log.status === 'error' ? '#f43f5e' : 'var(--border)'}`,
                      transition: '0.3s'
                    }}>
                      <div style={{ 
                        width: '45px', height: '45px', borderRadius: '10px', background: 'var(--background)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                      }}>
                         {log.status === 'success' ? <CheckCircle2 size={22} color="#10b981" /> : log.status === 'error' ? <AlertCircle size={22} color="#f43f5e" /> : <Loader2 size={20} className="animate-spin" color="var(--primary)" />}
                      </div>
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontWeight: 800, fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{log.name}</div>
                        <div style={{ fontSize: '0.8rem', color: log.status === 'success' ? '#10b981' : log.status === 'error' ? '#f43f5e' : 'var(--text-secondary)', fontWeight: 700 }}>
                          {log.message || (log.status === 'pending' ? 'جاري التحميل...' : 'بانتظار اكمال الصور الأخرى')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
