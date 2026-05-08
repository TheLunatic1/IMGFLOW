'use client';

import type { QueueItem } from '@/lib/types';

interface QueueListProps {
  queue: QueueItem[];
  onClear: () => void;
}

const statusMap = {
  waiting:    { cls: 'sw', label: 'WAITING',    bg: 'rgba(68,68,90,.15)',   color: 'var(--color-mu)' },
  processing: { cls: 'sp', label: 'PROCESSING', bg: 'rgba(198,241,53,.08)', color: 'var(--color-a)'  },
  done:       { cls: 'sd', label: 'DONE',       bg: 'rgba(0,212,168,.1)',   color: 'var(--color-a3)' },
  error:      { cls: 'se', label: 'ERROR',      bg: 'rgba(255,94,94,.1)',   color: 'var(--color-a4)' },
};

export default function QueueList({ queue, onClear }: QueueListProps) {
  return (
    <>
      {/* Queue header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--color-mu)' }}>
          QUEUE{' '}
          <span style={{ color: 'var(--color-a)', marginLeft: '7px' }}>
            {queue.length} {queue.length === 1 ? 'file' : 'files'}
          </span>
        </div>
        <button
          onClick={onClear}
          style={{
            background: 'none',
            border: '1px solid var(--color-bd)',
            color: 'var(--color-mu)',
            fontFamily: 'var(--font-mono)',
            fontSize: '9px',
            padding: '5px 12px',
            borderRadius: '5px',
            cursor: 'pointer',
            letterSpacing: '1px',
            transition: 'all .2s',
          }}
          onMouseEnter={e => {
            (e.target as HTMLButtonElement).style.borderColor = 'var(--color-a4)';
            (e.target as HTMLButtonElement).style.color = 'var(--color-a4)';
          }}
          onMouseLeave={e => {
            (e.target as HTMLButtonElement).style.borderColor = 'var(--color-bd)';
            (e.target as HTMLButtonElement).style.color = 'var(--color-mu)';
          }}
        >
          CLEAR ALL
        </button>
      </div>

      {/* Queue list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '20px' }}>
        {queue.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-mu)' }}>
            No images queued · drop files above to begin
          </div>
        ) : (
          queue.map(item => {
            const s = statusMap[item.status];
            return (
              <div
                key={item.id}
                className="qi-enter"
                style={{
                  background: 'var(--color-s1)',
                  border: '1px solid var(--color-bd)',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  display: 'grid',
                  gridTemplateColumns: '52px 1fr auto',
                  gap: '12px',
                  alignItems: 'center',
                }}
              >
                {/* Thumb */}
                {item.thumbURL ? (
                  <img
                    src={item.thumbURL}
                    alt={item.name}
                    style={{ width: '52px', height: '52px', borderRadius: '7px', objectFit: 'cover', background: 'var(--color-s2)', border: '1px solid var(--color-bd)' }}
                  />
                ) : (
                  <div style={{ width: '52px', height: '52px', borderRadius: '7px', background: 'var(--color-s2)', border: '1px solid var(--color-bd)' }} />
                )}

                {/* Info */}
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '3px', color: 'var(--color-tx)' }}>
                    {item.name}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--color-mu)', display: 'flex', gap: '8px' }}>
                    <span>{(item.size / 1024).toFixed(0)} KB</span>
                    {item.dims && <span>{item.dims}</span>}
                  </div>
                  {/* Progress bar */}
                  {item.status === 'processing' && (
                    <div style={{ height: '2px', background: 'var(--color-bd2)', borderRadius: '1px', marginTop: '7px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${item.progress}%`,
                          background: 'linear-gradient(90deg, var(--color-a), var(--color-a3))',
                          borderRadius: '1px',
                          transition: 'width .3s',
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Status badge */}
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '9px',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    whiteSpace: 'nowrap',
                    letterSpacing: '.5px',
                    background: s.bg,
                    color: s.color,
                  }}
                >
                  {s.label}
                </span>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
