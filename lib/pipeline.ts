// ─── Types ────────────────────────────────────────────────────────────────────
import type { PipelineConfig, ExtendAlign } from './types';

// ─── Canvas Loader ─────────────────────────────────────────────────────────────
export function loadCanvas(file: File): Promise<HTMLCanvasElement> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      c.getContext('2d')!.drawImage(img, 0, 0);
      URL.revokeObjectURL(img.src);
      res(c);
    };
    img.onerror = rej;
    img.src = URL.createObjectURL(file);
  });
}

// ─── Lanczos-3 ────────────────────────────────────────────────────────────────
function lanczos3(x: number): number {
  if (x === 0) return 1;
  if (Math.abs(x) >= 3) return 0;
  const p = Math.PI * x;
  return (Math.sin(p) / p) * (Math.sin(p / 3) / (p / 3));
}

export async function upscale(
  canvas: HTMLCanvasElement,
  factor: number,
  method: string
): Promise<HTMLCanvasElement> {
  const nW = Math.round(canvas.width * factor);
  const nH = Math.round(canvas.height * factor);

  if (method === 'bicubic' || factor <= 1) {
    const out = document.createElement('canvas');
    out.width = nW;
    out.height = nH;
    const ctx = out.getContext('2d')!;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(canvas, 0, 0, nW, nH);
    return out;
  }

  // Full Lanczos-3
  const src = canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height);
  const sd = src.data;
  const SW = canvas.width;
  const SH = canvas.height;
  const out = document.createElement('canvas');
  out.width = nW;
  out.height = nH;
  const oc = out.getContext('2d')!;
  const dst = oc.createImageData(nW, nH);
  const dd = dst.data;

  // Pre-compute x kernel weights
  const xK: { base: number; w: number[]; ws: number }[] = new Array(nW);
  for (let dx = 0; dx < nW; dx++) {
    const sx = (dx + 0.5) / factor - 0.5;
    const base = Math.floor(sx) - 2;
    const w: number[] = [];
    let ws = 0;
    for (let k = 0; k < 6; k++) {
      const v = lanczos3(sx - (base + k));
      w.push(v);
      ws += v;
    }
    xK[dx] = { base, w, ws: ws || 1 };
  }

  const TILE = 48;
  for (let ty = 0; ty < nH; ty += TILE) {
    for (let dy = ty; dy < Math.min(ty + TILE, nH); dy++) {
      const sy = (dy + 0.5) / factor - 0.5;
      const yb = Math.floor(sy) - 2;
      const yw: number[] = [];
      let yws = 0;
      for (let k = 0; k < 6; k++) {
        const v = lanczos3(sy - (yb + k));
        yw.push(v);
        yws += v;
      }
      yws = yws || 1;

      for (let dx = 0; dx < nW; dx++) {
        const { base: xb, w: xw, ws: xws } = xK[dx];
        let R = 0, G = 0, B = 0, A = 0;
        for (let ky = 0; ky < 6; ky++) {
          const sry = Math.max(0, Math.min(SH - 1, yb + ky));
          const ywk = yw[ky] / yws;
          for (let kx = 0; kx < 6; kx++) {
            const srx = Math.max(0, Math.min(SW - 1, xb + kx));
            const w = ywk * xw[kx] / xws;
            const pi = (sry * SW + srx) * 4;
            const srcA = sd[pi + 3] / 255;
            R += sd[pi] * srcA * w;
            G += sd[pi + 1] * srcA * w;
            B += sd[pi + 2] * srcA * w;
            A += srcA * w;
          }
        }
        const pi2 = (dy * nW + dx) * 4;
        if (A > 1e-6) {
          dd[pi2]     = Math.max(0, Math.min(255, (R / A) + 0.5)) | 0;
          dd[pi2 + 1] = Math.max(0, Math.min(255, (G / A) + 0.5)) | 0;
          dd[pi2 + 2] = Math.max(0, Math.min(255, (B / A) + 0.5)) | 0;
          dd[pi2 + 3] = Math.max(0, Math.min(255, A * 255 + 0.5)) | 0;
        }
      }
    }
    await new Promise(r => setTimeout(r, 0));
  }
  oc.putImageData(dst, 0, 0);
  return out;
}

// ─── Shopify Resize ───────────────────────────────────────────────────────────
export function shopifyResize(canvas: HTMLCanvasElement, maxDim: number): HTMLCanvasElement {
  const r = Math.min(maxDim / canvas.width, maxDim / canvas.height, 1);
  if (r >= 1) return canvas;
  const out = document.createElement('canvas');
  out.width = Math.round(canvas.width * r);
  out.height = Math.round(canvas.height * r);
  const ctx = out.getContext('2d')!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(canvas, 0, 0, out.width, out.height);
  return out;
}

// ─── WebP Encoder ─────────────────────────────────────────────────────────────
export function encodeWebP(
  canvas: HTMLCanvasElement,
  quality: number,
  maxKB: number
): Promise<{ blob: Blob; dataURL: string }> {
  return new Promise(res => {
    let q = quality;
    const go = () =>
      canvas.toBlob(blob => {
        if (!blob) return;
        if (blob.size > maxKB * 1024 && q > 0.2) {
          q = Math.max(q - 0.04, 0.2);
          go();
        } else {
          const r = new FileReader();
          r.onload = () => res({ blob, dataURL: r.result as string });
          r.readAsDataURL(blob);
        }
      }, 'image/webp', q);
    go();
  });
}

// ─── Smart Crop ───────────────────────────────────────────────────────────────
export function smartCrop(canvas: HTMLCanvasElement, cfg: PipelineConfig): HTMLCanvasElement {
  const targetW = cfg.smartCropW;
  const targetH = cfg.smartCropH;
  const out = document.createElement('canvas');
  out.width = targetW;
  out.height = targetH;
  const ctx = out.getContext('2d')!;
  const scale = Math.min(targetW / canvas.width, targetH / canvas.height);
  const newW = Math.round(canvas.width * scale);
  const newH = Math.round(canvas.height * scale);
  const x = Math.floor((targetW - newW) / 2);
  const y = Math.floor((targetH - newH) / 2);
  ctx.drawImage(canvas, x, y, newW, newH);
  return out;
}

// ─── Image Extender ───────────────────────────────────────────────────────────
interface ExtendedCanvas extends HTMLCanvasElement {
  _srcW?: number;
  _srcH?: number;
  _ox?: number;
  _oy?: number;
}

function getOffset(
  srcW: number,
  srcH: number,
  W: number,
  H: number,
  align: ExtendAlign
): { ox: number; oy: number } {
  const cx = Math.round((W - srcW) / 2);
  const cy = Math.round((H - srcH) / 2);
  const bx = W - srcW;
  const by = H - srcH;
  let ox = cx, oy = cy;
  switch (align) {
    case 'top-left':      ox = 0;  oy = 0;  break;
    case 'top-center':    ox = cx; oy = 0;  break;
    case 'top-right':     ox = bx; oy = 0;  break;
    case 'middle-left':   ox = 0;  oy = cy; break;
    case 'middle-right':  ox = bx; oy = cy; break;
    case 'bottom-left':   ox = 0;  oy = by; break;
    case 'bottom-center': ox = cx; oy = by; break;
    case 'bottom-right':  ox = bx; oy = by; break;
    default:              ox = cx; oy = cy; break;
  }
  return { ox: Math.max(0, ox), oy: Math.max(0, oy) };
}

export function extendCanvas(
  srcCanvas: HTMLCanvasElement,
  targetW: number,
  targetH: number,
  align: ExtendAlign
): ExtendedCanvas {
  const W = Math.max(targetW, srcCanvas.width);
  const H = Math.max(targetH, srcCanvas.height);
  const out = document.createElement('canvas') as ExtendedCanvas;
  out.width = W;
  out.height = H;
  const ctx = out.getContext('2d')!;
  const { ox, oy } = getOffset(srcCanvas.width, srcCanvas.height, W, H, align);
  out._srcW = srcCanvas.width;
  out._srcH = srcCanvas.height;
  out._ox = ox;
  out._oy = oy;
  ctx.clearRect(0, 0, W, H);
  ctx.drawImage(srcCanvas, ox, oy);
  return out;
}

export function fillExtendedEdges(
  canvas: ExtendedCanvas,
  targetW: number,
  targetH: number,
  align: ExtendAlign,
  blendRadius: number
): ExtendedCanvas {
  const W = canvas.width;
  const H = canvas.height;
  const ctx = canvas.getContext('2d')!;
  const imgData = ctx.getImageData(0, 0, W, H);
  const data = imgData.data;
  const ox = canvas._ox || 0;
  const oy = canvas._oy || 0;
  const srcW = canvas._srcW || W;
  const srcH = canvas._srcH || H;

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const pi = (y * W + x) * 4;
      const inOrig = x >= ox && x < ox + srcW && y >= oy && y < oy + srcH;
      if (inOrig) continue;
      const cx2 = Math.max(ox, Math.min(ox + srcW - 1, x));
      const cy2 = Math.max(oy, Math.min(oy + srcH - 1, y));
      const sp = (cy2 * W + cx2) * 4;
      data[pi] = data[sp];
      data[pi + 1] = data[sp + 1];
      data[pi + 2] = data[sp + 2];
      data[pi + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);
  if (blendRadius > 0) blendEdgeBoundary(ctx, ox, oy, srcW, srcH, W, H, blendRadius);
  return canvas;
}

function blendEdgeBoundary(
  ctx: CanvasRenderingContext2D,
  ox: number, oy: number,
  srcW: number, srcH: number,
  W: number, H: number,
  radius: number
): void {
  const imgData = ctx.getImageData(0, 0, W, H);
  const data = imgData.data;
  for (let y = oy; y < oy + srcH; y++) {
    for (let x = ox; x < ox + srcW; x++) {
      const dx = Math.min(x - ox, ox + srcW - 1 - x);
      const dy = Math.min(y - oy, oy + srcH - 1 - y);
      const d = Math.min(dx, dy);
      if (d >= radius) continue;
      const t = d / radius;
      const pi = (y * W + x) * 4;
      const nx = Math.max(0, Math.min(W - 1, x < ox + d ? ox - 1 : x > ox + srcW - 1 - d ? ox + srcW : x));
      const ny = Math.max(0, Math.min(H - 1, y < oy + d ? oy - 1 : y > oy + srcH - 1 - d ? oy + srcH : y));
      const np = (ny * W + nx) * 4;
      data[pi]     = Math.round(data[pi]     * t + data[np]     * (1 - t));
      data[pi + 1] = Math.round(data[pi + 1] * t + data[np + 1] * (1 - t));
      data[pi + 2] = Math.round(data[pi + 2] * t + data[np + 2] * (1 - t));
    }
  }
  ctx.putImageData(imgData, 0, 0);
}

// ─── Gaussian Blur Alpha ──────────────────────────────────────────────────────
function gaussBlurAlpha(alpha: Float32Array, W: number, H: number, radius: number): Float32Array {
  const sigma = radius * 0.45 + 0.5;
  const ksize = Math.ceil(radius * 2.5) * 2 + 1;
  const kern: number[] = [];
  let ks = 0;
  for (let i = 0; i < ksize; i++) {
    const x = i - Math.floor(ksize / 2);
    const v = Math.exp(-(x * x) / (2 * sigma * sigma));
    kern.push(v);
    ks += v;
  }
  for (let i = 0; i < ksize; i++) kern[i] /= ks;
  const half = Math.floor(ksize / 2);
  const tmp = new Float32Array(W * H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      let v = 0;
      for (let k = 0; k < ksize; k++) {
        const sx = Math.max(0, Math.min(W - 1, x + k - half));
        v += kern[k] * alpha[y * W + sx];
      }
      tmp[y * W + x] = v;
    }
  }
  const out2 = new Float32Array(W * H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      let v = 0;
      for (let k = 0; k < ksize; k++) {
        const sy = Math.max(0, Math.min(H - 1, y + k - half));
        v += kern[k] * tmp[sy * W + x];
      }
      out2[y * W + x] = v;
    }
  }
  return out2;
}

// ─── BG Removal ───────────────────────────────────────────────────────────────
let imglyRemoveBackground: ((blob: Blob) => Promise<Blob>) | null = null;

export async function removeBackgroundAI(
  srcCanvas: HTMLCanvasElement,
  featherRadius: number = 5,
  alphaThreshold: number = 80,
  onLog?: (msg: string) => void
): Promise<HTMLCanvasElement> {
  if (!imglyRemoveBackground) {
    onLog?.('loading AI model (first run only)...');
    const mod = await import(/* webpackIgnore: true */ 'https://esm.sh/@imgly/background-removal@1.7.0');
    imglyRemoveBackground = mod.default || mod.removeBackground;
  }

  const srcBlob = await new Promise<Blob>(res => srcCanvas.toBlob(b => res(b!), 'image/png'));
  const outBlob = await imglyRemoveBackground!(srcBlob);

  const bmp = await createImageBitmap(outBlob);
  const outCanvas = document.createElement('canvas');
  outCanvas.width = srcCanvas.width;
  outCanvas.height = srcCanvas.height;
  const ctx = outCanvas.getContext('2d')!;
  ctx.drawImage(bmp, 0, 0);
  bmp.close();

  // Alpha threshold clamp
  let imgData = ctx.getImageData(0, 0, outCanvas.width, outCanvas.height);
  const data = imgData.data;
  const lo = alphaThreshold;
  const hi = 255 - alphaThreshold;
  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    if      (a <= lo) data[i + 3] = 0;
    else if (a >= hi) data[i + 3] = 255;
  }
  ctx.putImageData(imgData, 0, 0);

  // Edge feather
  if (featherRadius > 0) {
    imgData = ctx.getImageData(0, 0, outCanvas.width, outCanvas.height);
    const alphaOnly = new Float32Array(outCanvas.width * outCanvas.height);
    for (let i = 0; i < alphaOnly.length; i++) alphaOnly[i] = imgData.data[i * 4 + 3] / 255;
    const blurred = gaussBlurAlpha(alphaOnly, outCanvas.width, outCanvas.height, featherRadius);
    for (let i = 0; i < blurred.length; i++) imgData.data[i * 4 + 3] = Math.round(blurred[i] * 255);
    ctx.putImageData(imgData, 0, 0);
  }
  return outCanvas;
}
