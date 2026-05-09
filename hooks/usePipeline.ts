'use client';

import { useReducer, useEffect, useCallback, useRef } from 'react';
import type {
  FlowType, QueueItem, ResultItem, PipelineSettings, PresetType,
} from '@/lib/types';
import { DEFAULT_SETTINGS } from '@/lib/types';
import {
  loadCanvas, upscale, shopifyResize, encodeWebP,
  smartCrop, extendCanvas, fillExtendedEdges, removeBackgroundAI,
} from '@/lib/pipeline';

// ─── State ────────────────────────────────────────────────────────────────────
interface State {
  flow: FlowType;
  queue: QueueItem[];
  results: ResultItem[];
  logs: { msg: string; cls: string }[];
  settings: PipelineSettings;
  running: boolean;
  statsCount: number;
  pipeStepStates: ('idle' | 'running' | 'done')[];
}

const initialState: State = {
  flow: 1,
  queue: [],
  results: [],
  logs: [],
  settings: DEFAULT_SETTINGS,
  running: false,
  statsCount: 0,
  pipeStepStates: [],
};

// ─── Actions ──────────────────────────────────────────────────────────────────
type Action =
  | { type: 'SET_FLOW'; flow: FlowType }
  | { type: 'ADD_ITEMS'; items: QueueItem[] }
  | { type: 'CLEAR_QUEUE' }
  | { type: 'UPDATE_ITEM'; id: string; patch: Partial<QueueItem> }
  | { type: 'ADD_RESULT'; result: ResultItem }
  | { type: 'CLEAR_RESULTS' }
  | { type: 'ADD_LOG'; msg: string; cls: string }
  | { type: 'CLEAR_LOGS' }
  | { type: 'SET_SETTINGS'; patch: Partial<PipelineSettings> }
  | { type: 'SET_RUNNING'; value: boolean }
  | { type: 'SET_STATS'; count: number }
  | { type: 'SET_PIPE_STEPS'; states: ('idle' | 'running' | 'done')[] }
  | { type: 'SET_PIPE_STEP'; index: number; state: 'idle' | 'running' | 'done' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_FLOW':
      return { ...state, flow: action.flow };
    case 'ADD_ITEMS':
      return { ...state, queue: [...state.queue, ...action.items] };
    case 'CLEAR_QUEUE':
      return { ...state, queue: [] };
    case 'UPDATE_ITEM':
      return {
        ...state,
        queue: state.queue.map(q => q.id === action.id ? { ...q, ...action.patch } : q),
      };
    case 'ADD_RESULT':
      return { ...state, results: [...state.results, action.result] };
    case 'CLEAR_RESULTS':
      return { ...state, results: [] };
    case 'ADD_LOG':
      return { ...state, logs: [...state.logs, { msg: action.msg, cls: action.cls }] };
    case 'CLEAR_LOGS':
      return { ...state, logs: [] };
    case 'SET_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.patch } };
    case 'SET_RUNNING':
      return { ...state, running: action.value };
    case 'SET_STATS':
      return { ...state, statsCount: action.count };
    case 'SET_PIPE_STEPS':
      return { ...state, pipeStepStates: action.states };
    case 'SET_PIPE_STEP': {
      const next = [...state.pipeStepStates];
      next[action.index] = action.state;
      return { ...state, pipeStepStates: next };
    }
    default:
      return state;
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function usePipeline() {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Fetch global count on mount
  useEffect(() => {
    fetch('/api/counter')
      .then(r => r.json())
      .then(data => { if (data.count) dispatch({ type: 'SET_STATS', count: data.count }); })
      .catch(() => {});
  }, []);
  const stateRef = useRef(state);
  stateRef.current = state;

  const log = useCallback((msg: string, cls = '') => {
    dispatch({ type: 'ADD_LOG', msg, cls });
  }, []);

  const addFiles = useCallback((files: File[]) => {
    const current = stateRef.current.queue;
    const newItems: QueueItem[] = [];
    files
      .filter(f => f.type.startsWith('image/'))
      .forEach(f => {
        if (current.find(q => q.name === f.name && q.size === f.size)) return;
        const item: QueueItem = {
          id: `${Date.now()}-${Math.random()}`,
          file: f,
          name: f.name,
          size: f.size,
          status: 'waiting',
          progress: 0,
        };

        // Read thumb + dims
        const reader = new FileReader();
        reader.onload = e => {
          dispatch({ type: 'UPDATE_ITEM', id: item.id, patch: { thumbURL: e.target?.result as string } });
        };
        reader.readAsDataURL(f);

        const img = new Image();
        const url = URL.createObjectURL(f);
        img.onload = () => {
          dispatch({ type: 'UPDATE_ITEM', id: item.id, patch: { dims: `${img.width}×${img.height}` } });
          URL.revokeObjectURL(url);
        };
        img.src = url;

        newItems.push(item);
      });
    if (newItems.length) dispatch({ type: 'ADD_ITEMS', items: newItems });
  }, []);

  const clearQueue = useCallback(() => {
    dispatch({ type: 'CLEAR_QUEUE' });
  }, []);

  const applyPreset = useCallback((p: PresetType) => {
    const presets: Record<PresetType, Partial<PipelineSettings>> = {
      quick:    { method: 'bicubic', factor: 2, quality: 0.75, maxKB: 300, preset: 'quick' },
      balanced: { method: 'lanczos', factor: 2, quality: 0.85, maxKB: 500, preset: 'balanced' },
      max:      { method: 'lanczos', factor: 3, quality: 0.95, maxKB: 2000, preset: 'max' },
    };
    dispatch({ type: 'SET_SETTINGS', patch: presets[p] });
  }, []);

  const setSettings = useCallback((patch: Partial<PipelineSettings>) => {
    dispatch({ type: 'SET_SETTINGS', patch });
  }, []);

  const setFlow = useCallback((f: FlowType) => {
    dispatch({ type: 'SET_FLOW', flow: f });
  }, []);

  const runPipeline = useCallback(async () => {
    const { queue, flow, settings } = stateRef.current;
    if (!queue.length) return;

    dispatch({ type: 'CLEAR_RESULTS' });
    dispatch({ type: 'CLEAR_LOGS' });
    dispatch({ type: 'SET_RUNNING', value: true });

    const stepCounts: Record<number, number> = { 1: 3, 2: 4, 3: 4 };
    const total = stepCounts[flow];

    const setPipeStep = (i: number, s: 'idle' | 'running' | 'done') => {
      dispatch({ type: 'SET_PIPE_STEP', index: i, state: s });
    };

    const results: ResultItem[] = [];

    for (const item of queue) {
      dispatch({ type: 'UPDATE_ITEM', id: item.id, patch: { status: 'processing', progress: 0 } });
      log(`Processing: ${item.name}`);

      try {
        let canvas = await loadCanvas(item.file);
        let step = 0;

        if (flow === 3) {
          // Step 1: Smart Crop
          setPipeStep(step, 'running');
          log(`  → smart crop to ${settings.smartCropW}×${settings.smartCropH}...`, 'warn');
          canvas = smartCrop(canvas, settings);
          setPipeStep(step, 'done'); step++;
          dispatch({ type: 'UPDATE_ITEM', id: item.id, patch: { progress: Math.round(step / total * 100) } });
          log(`  ✓ cropped → ${canvas.width}×${canvas.height}`, 'ok');

          // Step 2: Extend Canvas
          setPipeStep(step, 'running');
          log('  → extending canvas...', 'warn');
          canvas = extendCanvas(canvas, settings.extendW, settings.extendH, settings.extendAlign, settings.bgMode, settings.bgColor);
          setPipeStep(step, 'done'); step++;
          dispatch({ type: 'UPDATE_ITEM', id: item.id, patch: { progress: Math.round(step / total * 100) } });

          // Step 3: Fill Edges (pixel mode only)
          setPipeStep(step, 'running');
          if (settings.bgMode === 'pixel') {
            log('  → filling edges...', 'warn');
            canvas = fillExtendedEdges(canvas as any, settings.extendW, settings.extendH, settings.extendAlign, settings.extendBlend) as HTMLCanvasElement;
          } else {
            log('  → transparent background...', 'warn');
          }
          setPipeStep(step, 'done'); step++;
          dispatch({ type: 'UPDATE_ITEM', id: item.id, patch: { progress: Math.round(step / total * 100) } });

        } else {
          if (flow === 2) {
            setPipeStep(step, 'running');
            log('  → AI background removal...', 'warn');
            canvas = await removeBackgroundAI(canvas, settings.feather, settings.bgSens, (m) => log(`  → ${m}`, 'warn'));
            setPipeStep(step, 'done'); step++;
            dispatch({ type: 'UPDATE_ITEM', id: item.id, patch: { progress: Math.round(step / total * 100) } });
          }

          setPipeStep(step, 'running');
          log(`  → upscaling ×${settings.factor}...`, 'warn');
          canvas = await upscale(canvas, settings.factor, settings.method);
          setPipeStep(step, 'done'); step++;
          dispatch({ type: 'UPDATE_ITEM', id: item.id, patch: { progress: Math.round(step / total * 100) } });

          setPipeStep(step, 'running');
          log('  → shopify resize...', 'warn');
          canvas = shopifyResize(canvas, settings.shopify);
          setPipeStep(step, 'done'); step++;
          dispatch({ type: 'UPDATE_ITEM', id: item.id, patch: { progress: Math.round(step / total * 100) } });
        }

        // WebP
        setPipeStep(step, 'running');
        log('  → encoding WebP...', 'warn');
        const { blob, dataURL } = await encodeWebP(canvas, settings.quality, settings.maxKB);
        setPipeStep(step, 'done');
        dispatch({ type: 'UPDATE_ITEM', id: item.id, patch: { progress: 100 } });

        const prefix = flow === 3 ? 'reframe' : flow === 2 ? 'nobg' : 'shopify';
        const base = item.name.replace(/\.[^.]+$/, '');
        const result: ResultItem = {
          id: item.id,
          name: `${prefix}_${base}.webp`,
          blob,
          dataURL,
          orig: item.size,
          size: blob.size,
          dims: `${canvas.width}×${canvas.height}`,
        };
        results.push(result);
        dispatch({ type: 'ADD_RESULT', result });
        dispatch({ type: 'UPDATE_ITEM', id: item.id, patch: { status: 'done' } });
        log(`  ✓ ${result.name} — ${(blob.size / 1024).toFixed(0)} KB`, 'ok');

      } catch (err: any) {
        dispatch({ type: 'UPDATE_ITEM', id: item.id, patch: { status: 'error' } });
        log('  ✗ ' + (err?.message || 'Unknown error'), 'err');
        console.error(err);
      }

      dispatch({ type: 'UPDATE_ITEM', id: item.id, patch: { progress: 0 } });
      // Reset pipe steps
      dispatch({ type: 'SET_PIPE_STEPS', states: [] });
    }

    const localCount = stateRef.current.statsCount + results.length;
    dispatch({ type: 'SET_STATS', count: localCount });
    dispatch({ type: 'SET_RUNNING', value: false });
    log(`Done. ${results.length} file(s) ready.`, 'ok');

    // Push to global counter
    if (results.length > 0) {
      try {
        const res = await fetch('/api/counter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ n: results.length }),
        });
        const data = await res.json();
        if (data.count) dispatch({ type: 'SET_STATS', count: data.count });
      } catch { /* non-critical */ }
    }
  }, [log]);

  const downloadAll = useCallback(async (results: ResultItem[]) => {
    if (!results.length) return;
    const { strFromU8, zipSync } = await import('fflate');
    const files: Record<string, Uint8Array> = {};
    for (const r of results) {
      const buf = await r.blob.arrayBuffer();
      files[r.name] = new Uint8Array(buf);
    }
    const zipped = zipSync(files);
    const blob = new Blob([zipped.buffer as ArrayBuffer], { type: 'application/zip' });    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'shopify_pipeline.zip';
    a.click();
  }, []);

  const downloadOne = useCallback((result: ResultItem) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(result.blob);
    a.download = result.name;
    a.click();
  }, []);

  return {
    state,
    addFiles,
    clearQueue,
    applyPreset,
    setSettings,
    setFlow,
    runPipeline,
    downloadAll,
    downloadOne,
  };
}