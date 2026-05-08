'use client';

import { usePipeline } from '@/hooks/usePipeline';
import Header from '@/components/Header';
import FlowTabs from '@/components/FlowTabs';
import PipelineTrack from '@/components/PipelineTrack';
import DropZone from '@/components/DropZone';
import SettingsGrid from '@/components/SettingsGrid';
import QueueList from '@/components/QueueList';
import LogPanel from '@/components/LogPanel';
import ResultsGrid from '@/components/ResultsGrid';

export default function Home() {
  const {
    state,
    addFiles,
    clearQueue,
    applyPreset,
    setSettings,
    setFlow,
    runPipeline,
    downloadAll,
    downloadOne,
  } = usePipeline();

  const { flow, queue, results, logs, settings, running, statsCount, pipeStepStates } = state;

  return (
    <main
      style={{
        position: 'relative',
        zIndex: 1,
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '48px 28px 120px',
      }}
    >
      <Header statsCount={statsCount} />

      <FlowTabs flow={flow} onSelect={setFlow} />

      <PipelineTrack flow={flow} stepStates={pipeStepStates} />

      <DropZone onFiles={addFiles} />

      <SettingsGrid
        flow={flow}
        settings={settings}
        onChange={setSettings}
        onPreset={applyPreset}
      />

      <LogPanel logs={logs} />

      <QueueList queue={queue} onClear={clearQueue} />

      {/* Run Button */}
      <button
        onClick={runPipeline}
        disabled={queue.length === 0 || running}
        style={{
          width: '100%',
          padding: '17px',
          background: 'var(--color-a)',
          border: 'none',
          borderRadius: '10px',
          color: '#050508',
          fontFamily: 'var(--font-syne)',
          fontSize: '16px',
          fontWeight: 800,
          letterSpacing: '1px',
          cursor: queue.length === 0 || running ? 'not-allowed' : 'pointer',
          transition: 'all .2s',
          marginBottom: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          opacity: queue.length === 0 || running ? 0.25 : 1,
        }}
        onMouseEnter={e => {
          if (queue.length > 0 && !running) {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 14px 48px rgba(198,241,53,.25)';
          }
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'none';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <span style={{ fontSize: '12px' }}>▶</span>
        <span>{running ? 'Processing…' : 'Run Pipeline'}</span>
      </button>

      <ResultsGrid
        results={results}
        onDownloadOne={downloadOne}
        onDownloadAll={downloadAll}
      />
    </main>
  );
}
