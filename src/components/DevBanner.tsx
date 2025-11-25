import React from 'react';
import { isSupabaseFallback, resetSupabaseClient } from '../lib/supabase';

export const DevBanner: React.FC = () => {
  if (!isSupabaseFallback) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 8,
        right: 8,
        zIndex: 9999,
        background: '#fffbe6',
        border: '1px solid #ffe58f',
        color: '#614700',
        padding: '8px 12px',
        borderRadius: 6,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        fontSize: 12,
        lineHeight: 1.4,
        maxWidth: 360
      }}
      aria-live="polite"
    >
      <strong>Supabase fallback client active</strong>
      <div>
        Set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> in <code>.env</code>.
      </div>
      <div style={{ marginTop: 6, opacity: 0.8 }}>
        Detected URL: {String(import.meta.env.VITE_SUPABASE_URL || '').slice(0, 36) || '—'}
      </div>
      <div style={{ opacity: 0.8 }}>
        Key length: {String(import.meta.env.VITE_SUPABASE_ANON_KEY || '').length}
      </div>
      <button
        onClick={() => { try { resetSupabaseClient(); } catch {}; window.location.reload(); }}
        style={{
          marginTop: 8,
          padding: '6px 10px',
          fontSize: 12,
          background: '#fff',
          border: '1px solid #d9d9d9',
          borderRadius: 4,
          cursor: 'pointer'
        }}
        aria-label="Reload Supabase client"
      >
        Reload Supabase client
      </button>
    </div>
  );
};

export default DevBanner;