export type FlowType = 1 | 2 | 3;
export type UpscaleMethod = 'lanczos' | 'bicubic';
export type PresetType = 'quick' | 'balanced' | 'max';
export type QueueStatus = 'waiting' | 'processing' | 'done' | 'error';
export type BgMode = 'pixel' | 'transparent';
export type ExtendAlign =
  | 'center' | 'top-left' | 'top-center' | 'top-right'
  | 'middle-left' | 'middle-right'
  | 'bottom-left' | 'bottom-center' | 'bottom-right';

export interface QueueItem {
  id: string;
  file: File;
  name: string;
  size: number;
  status: QueueStatus;
  progress: number;
  dims?: string;
  thumbURL?: string;
}

export interface ResultItem {
  id: string;
  name: string;
  blob: Blob;
  dataURL: string;
  orig: number;
  size: number;
  dims: string;
}

export interface PipelineConfig {
  factor: number;
  method: UpscaleMethod;
  shopify: number;
  quality: number;
  maxKB: number;
  bgSens: number;
  feather: number;
  smartCropW: number;
  smartCropH: number;
  extendW: number;
  extendH: number;
  extendAlign: ExtendAlign;
  extendBlend: number;
  bgMode: BgMode;
  bgColor: string;
  renamePattern: string;
}

export interface PipelineSettings extends PipelineConfig {
  preset: PresetType;
}

export const FLOW_STEPS: Record<number, [string, string][]> = {
  1: [['🔎', 'Lanczos\nUpscale'], ['📐', 'Shopify\nResize'], ['🌐', 'WebP\nEncode']],
  2: [['✂️', 'AI BG\nRemove'], ['🔎', 'Lanczos\nUpscale'], ['📐', 'Shopify\nResize'], ['🌐', 'WebP\nEncode']],
  3: [['✂', 'Smart\nCrop'], ['↔', 'Extend\nCanvas'], ['🎨', 'Fill\nEdges'], ['🌐', 'WebP\nEncode']],
};

export const DEFAULT_SETTINGS: PipelineSettings = {
  preset: 'balanced',
  factor: 2,
  method: 'lanczos',
  shopify: 2048,
  quality: 0.85,
  maxKB: 500,
  bgSens: 80,
  feather: 5,
  smartCropW: 1024,
  smartCropH: 1024,
  extendW: 1200,
  extendH: 1200,
  extendAlign: 'center',
  extendBlend: 24,
  bgMode: 'pixel',
  bgColor: '#ffffff',
  renamePattern: '',
};