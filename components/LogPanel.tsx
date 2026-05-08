'use client';

import { useEffect, useRef } from 'react';

interface LogPanelProps {
  logs: { msg: string; cls: string }[];
}

const logColors: Record<string, string> = {
  ok:   'var(--color-a3)',
  warn: 'var(--color-a)',
  err:  'var(--color-a4)',
  '':   'var(--color-mu)',
};

export default function LogPanel({ logs }: LogPanelProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [logs]);

  if (!logs.length) return null;

  return (
    <div
      ref={ref}
      style={{
        background: 'var(--color-s1)',
        border: '1px solid var(--color-bd)',
        borderRadius: '10px',
        padding: '14px 16px',
        marginBottom: '20px',
        maxHeight: '120px',
        overflowY: 'auto',
        fontFamily: 'var(--font-mono)',
      }}
    >
      {logs.map((l, i) => (
        <div
          key={i}
          style={{
            fontSize: '10px',
            color: logColors[l.cls] || logColors[''],
            lineHeight: '1.9',
          }}
        >
          » {l.msg}
        </div>
      ))}
    </div>
  );
}
