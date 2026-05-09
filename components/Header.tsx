'use client';

import { useEffect, useRef, useState } from 'react';

interface HeaderProps {
  statsCount: number;
}

function AnimatedCounter({ value }: { value: number }) {
  const [display, setDisplay] = useState(value);
  const [flash, setFlash] = useState(false);
  const prev = useRef(value);

  useEffect(() => {
    if (value === prev.current) return;
    const start = prev.current;
    const end = value;
    const diff = end - start;
    if (diff <= 0) { setDisplay(end); prev.current = end; return; }

    // Animate count up
    const duration = Math.min(1200, diff * 80);
    const startTime = performance.now();
    setFlash(true);
    setTimeout(() => setFlash(false), 600);

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + diff * eased));
      if (progress < 1) requestAnimationFrame(tick);
      else prev.current = end;
    };
    requestAnimationFrame(tick);
  }, [value]);

  return (
    <span
      style={{
        display: 'block',
        fontFamily: 'var(--font-syne)',
        fontSize: '28px',
        fontWeight: 800,
        lineHeight: '1',
        color: flash ? '#fff' : 'var(--color-a)',
        transition: 'color 0.3s ease',
        tabularNums: 'tabular-nums',
      } as React.CSSProperties}
    >
      {display.toLocaleString()}
    </span>
  );
}

export default function Header({ statsCount }: HeaderProps) {
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: '52px',
        gap: '20px',
        flexWrap: 'wrap',
        paddingBottom: '36px',
        borderBottom: '1px solid var(--color-bd)',
      }}
    >
      <div>
        {/* Eyebrow */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            letterSpacing: '3px',
            color: 'var(--color-a)',
            textTransform: 'uppercase',
            marginBottom: '10px',
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: 'var(--color-a)',
              animation: 'blink 2s ease-in-out infinite',
              display: 'inline-block',
            }}
          />
          shopify image pipeline
        </div>

        {/* Logo */}
        <h1
          style={{
            fontFamily: 'var(--font-syne)',
            fontSize: 'clamp(48px, 8vw, 88px)',
            fontWeight: 800,
            lineHeight: '.9',
            letterSpacing: '-2px',
            color: '#fff',
            marginBottom: '10px',
          }}
        >
          IMG<span style={{ color: 'var(--color-a)' }}>FLOW</span>
        </h1>

        {/* Tagline */}
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            color: 'var(--color-tx2)',
            letterSpacing: '.5px',
            lineHeight: '1.6',
          }}
        >
          upscale · compress · webp · bg removal · smart crop · extend — 100% local, zero api
        </div>
      </div>

      {/* Right side */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '12px',
          paddingTop: '6px',
        }}
      >
        {/* Version tag */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            color: 'var(--color-tx2)',
            border: '1px solid var(--color-bd2)',
            background: 'var(--color-s1)',
            padding: '6px 12px',
            borderRadius: '20px',
          }}
        >
          <span
            style={{
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              background: 'var(--color-a3)',
              animation: 'blink 1.5s ease-in-out infinite',
              display: 'inline-block',
            }}
          />
          v2.5 PRO
        </div>

        {/* Live counter */}
        <div style={{ textAlign: 'right' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              justifyContent: 'flex-end',
              marginBottom: '4px',
            }}
          >
            <span
              style={{
                width: '5px',
                height: '5px',
                borderRadius: '50%',
                background: '#22c55e',
                animation: 'blink 1.8s ease-in-out infinite',
                display: 'inline-block',
                flexShrink: 0,
              }}
            />
            <AnimatedCounter value={statsCount} />
          </div>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '9px',
              color: 'var(--color-mu)',
              letterSpacing: '2px',
            }}
          >
            images processed
          </span>
        </div>
      </div>
    </header>
  );
}