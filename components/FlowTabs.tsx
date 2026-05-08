'use client';

import type { FlowType } from '@/lib/types';

interface FlowTabsProps {
  flow: FlowType;
  onSelect: (f: FlowType) => void;
}

const TABS = [
  {
    n: 1 as FlowType,
    badge: 'standard',
    badgeStyle: {},
    name: 'Standard Pipeline',
    chain: ['Upscale', '→', 'Compress', '→', 'WebP'],
    accentVar: '--color-a',
    glowRgba: 'rgba(198,241,53,.08)',
    shadowRgba: 'rgba(198,241,53,.08)',
  },
  {
    n: 2 as FlowType,
    badge: 'ai',
    badgeStyle: { background: 'rgba(0,212,168,.07)', color: 'var(--color-a3)', borderColor: 'rgba(0,212,168,.2)' },
    name: 'No Background',
    chain: ['AI Remove BG', '→', 'Upscale', '→', 'WebP'],
    accentVar: '--color-a3',
    glowRgba: 'rgba(0,212,168,.08)',
    shadowRgba: 'rgba(0,212,168,.08)',
  },
  {
    n: 3 as FlowType,
    badge: 'crop',
    badgeStyle: { background: 'rgba(108,77,255,.07)', color: 'var(--color-a2)', borderColor: 'rgba(108,77,255,.2)' },
    name: 'Smart Crop',
    chain: ['Crop', '→', 'Upscale', '→', 'WebP'],
    accentVar: '--color-a2',
    glowRgba: 'rgba(108,77,255,.08)',
    shadowRgba: 'rgba(108,77,255,.08)',
  },
  {
    n: 4 as FlowType,
    badge: 'new',
    badgeStyle: { background: 'rgba(255,169,82,.12)', color: 'var(--color-a5)', borderColor: 'rgba(255,169,82,.3)' },
    name: 'Image Extender',
    chain: ['Extend Canvas', '→', 'Fill Edges', '→', 'WebP'],
    accentVar: '--color-a5',
    glowRgba: 'rgba(255,169,82,.08)',
    shadowRgba: 'rgba(255,169,82,.08)',
  },
];

export default function FlowTabs({ flow, onSelect }: FlowTabsProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '8px',
        marginBottom: '20px',
      }}
    >
      {TABS.map(tab => {
        const active = flow === tab.n;
        const accent = `var(${tab.accentVar})`;
        return (
          <button
            key={tab.n}
            onClick={() => onSelect(tab.n)}
            style={{
              background: active ? 'var(--color-s2)' : 'var(--color-s1)',
              border: `1px solid ${active ? accent : 'var(--color-bd)'}`,
              borderRadius: '12px',
              padding: '18px 16px',
              cursor: 'pointer',
              color: 'var(--color-tx)',
              textAlign: 'left',
              transition: 'all .2s ease',
              fontFamily: 'var(--font-syne)',
              position: 'relative',
              boxShadow: active ? `0 0 0 1px ${accent}, 0 8px 32px ${tab.shadowRgba}` : 'none',
            }}
          >
            {/* Tab top row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  fontWeight: 600,
                  color: active ? accent : 'var(--color-mu)',
                  letterSpacing: '1px',
                }}
              >
                0{tab.n}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '8px',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  padding: '2px 7px',
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,.04)',
                  color: 'var(--color-mu)',
                  border: '1px solid var(--color-bd)',
                  ...tab.badgeStyle,
                }}
              >
                {tab.badge}
              </span>
            </div>

            {/* Tab name */}
            <div
              style={{
                fontSize: '14px',
                fontWeight: 700,
                letterSpacing: '-.3px',
                marginBottom: '10px',
                color: active ? 'var(--color-tx)' : 'var(--color-tx2)',
              }}
            >
              {tab.name}
            </div>

            {/* Chain chips */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', flexWrap: 'wrap' }}>
              {tab.chain.map((c, i) =>
                c === '→' ? (
                  <span key={i} style={{ color: 'var(--color-mu)', fontSize: '8px' }}>→</span>
                ) : (
                  <span
                    key={i}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '8px',
                      padding: '2px 6px',
                      borderRadius: '3px',
                      background: 'rgba(255,255,255,.03)',
                      color: active ? 'var(--color-tx2)' : 'var(--color-mu)',
                      border: `1px solid ${active ? 'var(--color-bd2)' : 'var(--color-bd)'}`,
                    }}
                  >
                    {c}
                  </span>
                )
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
