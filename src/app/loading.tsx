import React from 'react';

export default function GlobalLoading() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      width: '100%',
      background: 'var(--background)'
    }}>
      <div style={{
        width: '50px',
        height: '50px',
        border: '3px solid rgba(225,29,72,0.1)',
        borderTop: '3px solid var(--primary)',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
