'use client';

interface HeaderProps {
  statsCount: number;
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

        {/* Stats */}
        <div style={{ textAlign: 'right' }}>
          <span
            style={{
              display: 'block',
              fontFamily: 'var(--font-syne)',
              fontSize: '28px',
              fontWeight: 800,
              color: 'var(--color-a)',
              lineHeight: '1',
            }}
          >
            {statsCount}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '9px',
              color: 'var(--color-mu)',
              letterSpacing: '2px',
            }}
          >
            processed
          </span>
        </div>
      </div>
    </header>
  );
}
