'use client';

import type { FlowType, PipelineSettings, PresetType, ExtendAlign, UpscaleMethod } from '@/lib/types';

interface SettingsGridProps {
  flow: FlowType;
  settings: PipelineSettings;
  onChange: (patch: Partial<PipelineSettings>) => void;
  onPreset: (p: PresetType) => void;
}

const sgStyle: React.CSSProperties = {
  background: 'var(--color-s1)',
  border: '1px solid var(--color-bd)',
  borderRadius: '10px',
  padding: '14px 16px',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-mono)',
  fontSize: '9px',
  letterSpacing: '2px',
  textTransform: 'uppercase',
  color: 'var(--color-mu)',
  marginBottom: '9px',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--color-s2)',
  border: '1px solid var(--color-bd2)',
  borderRadius: '6px',
  color: 'var(--color-tx)',
  fontFamily: 'var(--font-mono)',
  fontSize: '11px',
  padding: '8px 10px',
  outline: 'none',
};

const rvalStyle: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: '11px',
  color: 'var(--color-a)',
  minWidth: '28px',
  textAlign: 'right',
};

export default function SettingsGrid({ flow, settings, onChange, onPreset }: SettingsGridProps) {
  const presets: PresetType[] = ['quick', 'balanced', 'max'];
  const presetLabels: Record<PresetType, string> = { quick: '⚡ Quick', balanced: '⚖ Balanced', max: '💎 Max Quality' };

  return (
    <>
      {/* Presets row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '3px', color: 'var(--color-mu)', whiteSpace: 'nowrap' }}>
          PRESET
        </span>
        <div style={{ display: 'flex', gap: '6px' }}>
          {presets.map(p => (
            <button
              key={p}
              onClick={() => onPreset(p)}
              style={{
                background: settings.preset === p ? 'rgba(198,241,53,.08)' : 'var(--color-s1)',
                border: `1px solid ${settings.preset === p ? 'var(--color-a)' : 'var(--color-bd)'}`,
                color: settings.preset === p ? 'var(--color-a)' : 'var(--color-tx2)',
                padding: '7px 14px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                letterSpacing: '.5px',
                transition: 'all .2s',
              }}
            >
              {presetLabels[p]}
            </button>
          ))}
        </div>
      </div>

      {/* Settings grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(195px, 1fr))',
          gap: '10px',
          marginBottom: '16px',
        }}
      >
        {/* Upscale Method */}
        <div style={sgStyle}>
          <label style={labelStyle}>Upscale Method</label>
          <select
            value={settings.method}
            onChange={e => onChange({ method: e.target.value as UpscaleMethod })}
            style={inputStyle}
          >
            <option value="lanczos">Lanczos-3 (sharpest)</option>
            <option value="bicubic">Bicubic (fast)</option>
          </select>
        </div>

        {/* Upscale Factor */}
        <div style={sgStyle}>
          <label style={labelStyle}>Upscale Factor</label>
          <select
            value={settings.factor}
            onChange={e => onChange({ factor: parseFloat(e.target.value) })}
            style={inputStyle}
          >
            <option value="2">2× — Recommended</option>
            <option value="1.5">1.5×</option>
            <option value="3">3×</option>
            <option value="4">4×</option>
          </select>
        </div>

        {/* Shopify Size */}
        <div style={sgStyle}>
          <label style={labelStyle}>Shopify Max Dimension</label>
          <select
            value={settings.shopify}
            onChange={e => onChange({ shopify: parseInt(e.target.value) })}
            style={inputStyle}
          >
            <option value="2048">2048px — Master</option>
            <option value="1024">1024px — Standard</option>
            <option value="800">800px — Compact</option>
            <option value="4472">4472px — Max (20MP)</option>
          </select>
        </div>

        {/* WebP Quality */}
        <div style={sgStyle}>
          <label style={labelStyle}>
            WebP Quality{' '}
            <span style={rvalStyle}>{Math.round(settings.quality * 100)}</span>
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="range"
              min="40"
              max="100"
              value={Math.round(settings.quality * 100)}
              onChange={e => onChange({ quality: parseInt(e.target.value) / 100 })}
              style={{ flex: 1 }}
            />
          </div>
        </div>

        {/* Max KB */}
        <div style={sgStyle}>
          <label style={labelStyle}>Max Output (KB)</label>
          <input
            type="number"
            value={settings.maxKB}
            min={50}
            max={5000}
            step={50}
            onChange={e => onChange({ maxKB: parseInt(e.target.value) })}
            style={inputStyle}
          />
        </div>

        {/* Rename Pattern */}
        <div style={sgStyle}>
          <label style={labelStyle}>Rename Pattern</label>
          <input
            type="text"
            value={settings.renamePattern}
            placeholder="{name} or product_{n}"
            onChange={e => onChange({ renamePattern: e.target.value })}
            style={{ ...inputStyle, fontSize: '11px' }}
          />
        </div>

        {/* BG Removal — flow 2 only */}
        {flow === 2 && (
          <>
            <div style={sgStyle}>
              <label style={labelStyle}>
                Alpha Threshold <span style={rvalStyle}>{settings.bgSens}</span>
              </label>
              <input
                type="range"
                min="1"
                max="80"
                value={settings.bgSens}
                onChange={e => onChange({ bgSens: parseInt(e.target.value) })}
                style={{ width: '100%' }}
              />
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', color: 'var(--color-mu)', marginTop: '6px', lineHeight: '1.4' }}>
                ↑ higher = harder cut, fewer stray pixels
              </div>
            </div>
            <div style={sgStyle}>
              <label style={labelStyle}>
                Edge Feather px <span style={rvalStyle}>{settings.feather}</span>
              </label>
              <input
                type="range"
                min="0"
                max="10"
                value={settings.feather}
                onChange={e => onChange({ feather: parseInt(e.target.value) })}
                style={{ width: '100%' }}
              />
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', color: 'var(--color-mu)', marginTop: '6px', lineHeight: '1.4' }}>
                ↑ higher = softer edge blur (0 = crisp)
              </div>
            </div>
          </>
        )}

        {/* Reframe (Smart Crop + Extend) — flow 3 only */}
        {flow === 3 && (
          <>
            <div style={sgStyle}>
              <label style={labelStyle}>Width (px)</label>
              <input
                type="number"
                value={settings.smartCropW}
                min={100} max={10000}
                onChange={e => {
                  const v = parseInt(e.target.value);
                  onChange({ smartCropW: v, extendW: v });
                }}
                style={inputStyle}
              />
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', color: 'var(--color-mu)', marginTop: '6px', lineHeight: '1.4' }}>
                crop + extend target
              </div>
            </div>
            <div style={sgStyle}>
              <label style={labelStyle}>Height (px)</label>
              <input
                type="number"
                value={settings.smartCropH}
                min={100} max={10000}
                onChange={e => {
                  const v = parseInt(e.target.value);
                  onChange({ smartCropH: v, extendH: v });
                }}
                style={inputStyle}
              />
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', color: 'var(--color-mu)', marginTop: '6px', lineHeight: '1.4' }}>
                crop + extend target
              </div>
            </div>
            <div style={sgStyle}>
              <label style={labelStyle}>Image Position</label>
              <select
                value={settings.extendAlign}
                onChange={e => onChange({ extendAlign: e.target.value as ExtendAlign })}
                style={inputStyle}
              >
                <option value="center">Center (default)</option>
                <option value="top-left">Top Left</option>
                <option value="top-center">Top Center</option>
                <option value="top-right">Top Right</option>
                <option value="middle-left">Middle Left</option>
                <option value="middle-right">Middle Right</option>
                <option value="bottom-left">Bottom Left</option>
                <option value="bottom-center">Bottom Center</option>
                <option value="bottom-right">Bottom Right</option>
              </select>
            </div>
            <div style={sgStyle}>
              <label style={labelStyle}>
                Edge Blend Radius <span style={rvalStyle}>{settings.extendBlend}</span>
              </label>
              <input
                type="range"
                min="0"
                max="80"
                value={settings.extendBlend}
                onChange={e => onChange({ extendBlend: parseInt(e.target.value) })}
                style={{ width: '100%' }}
              />
            </div>
          </>
        )}
      </div>

      {/* Reframe Info Banner — flow 3 only */}
      {flow === 3 && (
        <div
          style={{
            display: 'flex',
            gap: '14px',
            alignItems: 'flex-start',
            background: 'rgba(108,77,255,.04)',
            border: '1px solid rgba(108,77,255,.2)',
            borderRadius: '10px',
            padding: '16px 18px',
            marginBottom: '16px',
          }}
        >
          <div
            style={{
              fontSize: '18px',
              color: 'var(--color-a2)',
              width: '36px',
              height: '36px',
              background: 'rgba(108,77,255,.1)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            ✂↔
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-a2)', marginBottom: '4px' }}>
              Reframe Pipeline
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-tx2)', lineHeight: '1.6' }}>
              Smart-crops to your target crop size, then extends the canvas to your final dimensions — filling the new space with seamlessly blended edge colors. No AI required.
            </div>
          </div>
        </div>
      )}
    </>
  );
}