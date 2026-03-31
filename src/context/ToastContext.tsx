"use client";
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CheckCircle2, XCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  addToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: ToastType = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000); // Disappear after 4 seconds
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      
      {/* Global Toast Container */}
      <div style={{ position: 'fixed', bottom: '2rem', left: '2rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', zIndex: 99999 }}>
        {toasts.map(t => (
          <div key={t.id} style={{ 
            background: t.type === 'success' ? '#1f2937' : t.type === 'error' ? '#3d161a' : '#1e3a5f',
            border: `1px solid ${t.type === 'success' ? '#4cc9f0' : t.type === 'error' ? '#e63946' : '#4361ee'}`,
            color: 'var(--text-primary)', padding: '1rem 1.5rem', borderRadius: '8px', 
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', gap: '0.8rem', minWidth: '280px',
            animation: 'slideUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)', direction: 'rtl'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {t.type === 'success' && <CheckCircle2 size={24} color="#4cc9f0" />}
              {t.type === 'error' && <XCircle size={24} color="#e63946" />}
              {t.type === 'info' && <Info size={24} color="#4361ee" />}
            </span>
            <span style={{ fontWeight: 'bold' }}>{t.message}</span>
          </div>
        ))}
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}} />
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
};
