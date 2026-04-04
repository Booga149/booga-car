"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Search, Globe, Shield, Zap, ArrowDown, Activity } from 'lucide-react';
import SmartSearch from './SmartSearch';

export default function Hero() {
  const router = useRouter();
  
  return (
    <section style={{
      minHeight: '100vh',
      width: '100%',
      backgroundColor: 'var(--background)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      padding: '2rem'
    }}>
      {/* ─── Quantum Background Layer ─── */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: 'url("/premium_car_exploded_view_hero_1774815481734.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: 0.12,
        zIndex: 0,
        filter: 'grayscale(0.5) contrast(0.9)'
      }} />
      
      {/* ─── Technical HUD Overlay (Grid) ─── */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `linear-gradient(rgba(244, 63, 94, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(244, 63, 94, 0.03) 1px, transparent 1px)`,
        backgroundSize: '40px 40px',
        zIndex: 1,
        pointerEvents: 'none'
      }} />

      {/* ─── Cinematic Gradient & Vignette ─── */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(circle at 50% 50%, transparent 30%, var(--background) 100%)',
        zIndex: 2,
        pointerEvents: 'none'
      }} />

      {/* ─── Scanning Line Animation ─── */}
      <div className="scanning-line" style={{
        position: 'absolute', left: 0, right: 0, height: '2px',
        background: 'linear-gradient(90deg, transparent, var(--primary), transparent)',
        opacity: 0.3, zIndex: 3, top: '0', animation: 'scan 4s linear infinite'
      }} />

      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', maxWidth: '1100px', width: '100%' }}>
        
        {/* Floating Technical Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.8rem',
          background: 'var(--surface)', border: '1px solid var(--primary)',
          padding: '0.7rem 1.8rem', borderRadius: '40px',
          marginBottom: '3.5rem', fontSize: '0.9rem', fontWeight: 900,
          color: 'var(--text-primary)', letterSpacing: '3px', textTransform: 'uppercase',
          boxShadow: '0 4px 20px rgba(225,29,72,0.15)',
          animation: 'float 3s ease-in-out infinite'
        }}>
           <Activity size={18} color="var(--primary)" /> BOOGA QUANTUM ENGINEERING
        </div>

        {/* The Massive Eye-Grabbing Title */}
        <h1 style={{
          fontSize: 'clamp(2.5rem, 8vw, 5rem)',
          fontWeight: 950,
          color: 'var(--text-primary)',
          lineHeight: 0.9,
          marginBottom: '1.2rem',
          letterSpacing: '-2px',
        }}>
           <span style={{ display: 'block', opacity: 0.9 }}>بوجا</span>
           <span style={{ color: 'var(--primary)', WebkitTextStroke: '1px var(--primary)', WebkitTextFillColor: 'transparent' }}>كار</span>
        </h1>

        <p style={{
          fontSize: '1.4rem', color: 'var(--text-secondary)', 
          marginBottom: '4.5rem', maxWidth: '800px', margin: '0 auto 5rem',
          lineHeight: 1.6, fontWeight: 600, letterSpacing: '0.5px'
        }}>
          تجاوز حدود التجارة التقليدية. بوجا كار تربطك بقطاع <span style={{ color: 'var(--text-primary)', fontWeight: 900 }}>الأنظمة المعقدة</span> بمعايير المطابقة الفائقة.
        </p>

        {/* ─── HUD-Inspired Search Hub ─── */}
        <div style={{ 
          position: 'relative', maxWidth: '900px', margin: '0 auto',
          background: 'var(--surface)', padding: '0.5rem',
          borderRadius: '24px', border: '1px solid var(--border)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.08)'
        }}>
           <SmartSearch />
        </div>

        {/* Quick Tech Stats */}
        <div style={{ 
          display: 'flex', justifyContent: 'center', gap: '4rem', 
          marginTop: '6rem', opacity: 1, color: 'var(--text-primary)'
        }}>
           {[
             { label: 'دقة المطابقة', val: '99.9%', icon: <Shield size={16}/> },
             { label: 'سرعة المعالجة', val: '0.04s', icon: <Zap size={16}/> },
             { label: 'التغطية', val: 'Global', icon: <Globe size={16}/> }
           ].map((stat, i) => (
             <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '0.3rem', justifyContent: 'center' }}>
                  {stat.icon} {stat.label}
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 950 }}>{stat.val}</div>
             </div>
           ))}
        </div>
      </div>

      {/* Animated Scroll Indicator */}
      <div style={{ 
        position: 'absolute', bottom: '3rem', 
        display: 'flex', flexDirection: 'column', alignItems: 'center', 
        gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 700 
      }}>
         اكتشف المزيد
         <div style={{ animation: 'bounce 2s infinite' }}>
            <ArrowDown size={20} color="var(--primary)" />
         </div>
      </div>

      <style jsx>{`
        @keyframes scan {
          0% { top: -10%; opacity: 0; }
          10% { opacity: 0.3; }
          90% { opacity: 0.3; }
          100% { top: 110%; opacity: 0; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(10px); opacity: 1; }
        }
      `}</style>
    </section>
  );
}
