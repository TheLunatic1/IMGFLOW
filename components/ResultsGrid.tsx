'use client';

import type { ResultItem } from '@/lib/types';

interface ResultsGridProps {
  results: ResultItem[];
  onDownloadOne: (r: ResultItem) => void;
  onDownloadAll: (results: ResultItem[]) => void;
}

export default function ResultsGrid({ results, onDownloadOne, onDownloadAll }: ResultsGridProps) {
  if (!results.length) return null;

  return (
    <div style={{ marginTop: '8px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontFamily: 'var(--font-mono)',
        fontSize: '9px',
        letterSpacing: '3px',
        textTransform: 'uppercase',
        color: 'var(--color-mu)',
        marginBottom: '14px',
      }}>
        <span>Output Files</span>
        <span style={{ color: 'var(--color-a)' }}>{results.length} file{results.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '12px',
      }}>
        {results.map(r => {
          const savings = Math.round((1 - r.size / r.orig) * 100);
          return (
            <div
              key={r.id}
              className="rc-enter"
              style={{
                background: 'var(--color-s1)',
                border: '1px solid var(--color-bd)',
                borderRadius: '12px',
                overflow: 'hidden',
                transition: 'border-color .2s',
              }}
            >
              {/* Preview */}
              <img
                src={r.dataURL}
                alt={r.name}
                className="checker-bg"
                style={{ width: '100%', aspectRatio: '1', objectFit: 'contain', display: 'block' }}
              />

              {/* Body */}
              <div style={{ padding: '12px 14px', borderTop: '1px solid var(--color-bd)' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '8px', letterSpacing: '-.2px', color: 'var(--color-tx)' }}>
                  {r.name}
                </div>

                {/* Pills */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '10px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', padding: '3px 8px', borderRadius: '4px', background: 'rgba(198,241,53,.07)', color: 'var(--color-a)' }}>
                    {(r.size / 1024).toFixed(0)} KB
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: '9px', padding: '3px 8px', borderRadius: '4px',
                    background: savings > 0 ? 'rgba(0,212,168,.07)' : 'rgba(255,94,94,.07)',
                    color: savings > 0 ? 'var(--color-a3)' : 'var(--color-a4)',
                  }}>
                    {savings > 0 ? '↓' : '↑'}{Math.abs(savings)}%
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', padding: '3px 8px', borderRadius: '4px', background: 'rgba(0,212,168,.07)', color: 'var(--color-a3)' }}>
                    {r.dims}
                  </span>
                </div>

                {/* Download button */}
                <button
                  onClick={() => onDownloadOne(r)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    background: 'rgba(198,241,53,.05)',
                    border: '1px solid rgba(198,241,53,.15)',
                    borderRadius: '6px',
                    color: 'var(--color-a)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    cursor: 'pointer',
                    transition: 'all .2s',
                    letterSpacing: '.5px',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(198,241,53,.12)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(198,241,53,.05)')}
                >
                  ⬇ DOWNLOAD
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Download All ZIP */}
      <button
        onClick={() => onDownloadAll(results)}
        style={{
          marginTop: '16px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '11px 20px',
          background: 'rgba(0,212,168,.05)',
          border: '1px solid rgba(0,212,168,.2)',
          borderRadius: '8px',
          color: 'var(--color-a3)',
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          cursor: 'pointer',
          transition: 'all .2s',
          letterSpacing: '.5px',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,212,168,.1)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,212,168,.05)')}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 1v8M3 6l4 4 4-4M1 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Download All as ZIP
      </button>
    </div>
  );
}
