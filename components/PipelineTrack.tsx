'use client';

import { FLOW_STEPS } from '@/lib/types';
import type { FlowType } from '@/lib/types';

interface PipelineTrackProps {
  flow: FlowType;
  stepStates: ('idle' | 'running' | 'done')[];
}

export default function PipelineTrack({ flow, stepStates }: PipelineTrackProps) {
  const steps = FLOW_STEPS[flow];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        background: 'var(--color-s1)',
        border: '1px solid var(--color-bd)',
        borderRadius: '10px',
        padding: '16px 22px',
        marginBottom: '20px',
        overflowX: 'auto',
        scrollbarWidth: 'thin',
      }}
    >
      {steps.map((s, i) => {
        const stepState = stepStates[i] || 'idle';
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
              <div
                className={
                  stepState === 'running'
                    ? 'pt-icon-running'
                    : stepState === 'done'
                    ? 'pt-icon-done'
                    : ''
                }
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: 'var(--color-s2)',
                  border: '1.5px solid var(--color-bd2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  transition: 'all .3s',
                }}
              >
                {s[0]}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '8px',
                  color: 'var(--color-mu)',
                  textAlign: 'center',
                  maxWidth: '60px',
                  lineHeight: '1.4',
                }}
                dangerouslySetInnerHTML={{ __html: s[1].replace('\n', '<br>') }}
              />
            </div>
            {i < steps.length - 1 && (
              <div
                className={stepState === 'done' ? 'pt-line-done' : ''}
                style={{
                  flex: 1,
                  height: '1px',
                  background: 'var(--color-bd)',
                  minWidth: '20px',
                  maxWidth: '70px',
                  transition: 'background .3s',
                  margin: '0 4px',
                  alignSelf: 'flex-start',
                  marginTop: '19px',
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
