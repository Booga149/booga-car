"use client";
import React from 'react';

export default function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-image" />
      <div style={{ padding: '0.7rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div className="skeleton-line" style={{ width: '45%' }} />
        <div className="skeleton-line" style={{ width: '90%' }} />
        <div className="skeleton-line skeleton-line-short" />
        <div className="skeleton-line skeleton-line-price" />
        <div className="skeleton-btn" />
      </div>
    </div>
  );
}
