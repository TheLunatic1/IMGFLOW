// ═══════════════════════════════════════
// STATE
// ═══════════════════════════════════════
let flow = 1, queue = [], results = [];
let imglyRemoveBackground = null;

// ═══════════════════════════════════════
// FLOW UI
// ═══════════════════════════════════════
function selectFlow(n) {
  flow = n;
  document.querySelectorAll('.ftab').forEach((b, i) => b.classList.toggle('active', i === n - 1));

  document.getElementById('bgSensGroup').classList.toggle('sg-hidden', n !== 2);
  document.getElementById('bgFeatherGroup').classList.toggle('sg-hidden', n !== 2);
  document.querySelectorAll('.extend-setting').forEach(el => el.classList.toggle('sg-hidden', n !== 4));
  document.getElementById('extendInfo').classList.toggle('sg-hidden', n !== 4);
  document.querySelectorAll('.smartcrop-setting').forEach(el => el.classList.toggle('sg-hidden', n !== 3));

  renderTrack();
}

function renderTrack() {
  let steps;
  if (flow === 1) steps = [['🔎','Lanczos\nUpscale'], ['📐','Shopify\nResize'], ['🌐','WebP\nEncode']];
  else if (flow === 2) steps = [['✂️','AI BG\nRemove'], ['🔎','Lanczos\nUpscale'], ['📐','Shopify\nResize'], ['🌐','WebP\nEncode']];
  else if (flow === 3) steps = [['✂','Smart\nCrop'], ['🌐','WebP\nEncode']];
  else steps = [['↔','Extend\nCanvas'], ['🎨','Fill\nEdges'], ['🌐','WebP\nEncode']];

  document.getElementById('pipeTrack').innerHTML = steps.map((s, i) => `
    <div class="pt-step">
      <div class="pt-icon" id="ptd-${i}">${s[0]}</div>
      <div class="pt-label" id="ptl-${i}">${s[1].replace('\n', '<br>')}</div>
    </div>
    ${i < steps.length - 1 ? `<div class="pt-line" id="ptln-${i}"></div>` : ''}
  `).join('');
}

function pipeStep(i, state) {
  const d = document.getElementById('ptd-' + i);
  const l = document.getElementById('ptln-' + i);
  if (d) { d.classList.remove('running', 'done'); if (state) d.classList.add(state); }
  if (state === 'done' && l) l.classList.add('done');
}

function resetTrack() {
  document.querySelectorAll('.pt-icon').forEach(d => d.classList.remove('running', 'done'));
  document.querySelectorAll('.pt-line').forEach(l => l.classList.remove('done'));
}

// ═══════════════════════════════════════
// FILE INPUT
// ═══════════════════════════════════════
const dz = document.getElementById('dropZone');
const fi = document.getElementById('fileInput');

dz.addEventListener('dragover', e => { e.preventDefault(); dz.classList.add('drag'); });
dz.addEventListener('dragleave', () => dz.classList.remove('drag'));
dz.addEventListener('drop', e => { e.preventDefault(); dz.classList.remove('drag'); addFiles([...e.dataTransfer.files]); });
fi.addEventListener('change', () => { addFiles([...fi.files]); fi.value = ''; });

function addFiles(files) {
  files.filter(f => f.type.startsWith('image/')).forEach(f => {
    if (queue.find(q => q.name === f.name && q.size === f.size)) return;
    const item = { id: Date.now() + Math.random(), file: f, name: f.name, size: f.size };
    queue.push(item);
    renderQI(item);
  });
  syncQ();
}

function renderQI(item) {
  document.getElementById('emptyMsg')?.remove();
  const div = document.createElement('div');
  div.className = 'qi'; div.id = 'qi-' + item.id;
  div.innerHTML = `
    <img class="qi-thumb" id="qt-${item.id}" src="">
    <div>
      <div class="qi-name">${item.name}</div>
      <div class="qi-meta"><span>${(item.size / 1024).toFixed(0)} KB</span><span id="qdm-${item.id}">—</span></div>
      <div class="qpb" id="qpb-${item.id}"><div class="qpbr" id="qpbr-${item.id}"></div></div>
    </div>
    <span class="qs sw" id="qs-${item.id}">WAITING</span>`;
  document.getElementById('queueList').appendChild(div);

  const r = new FileReader();
  r.onload = e => { const el = document.getElementById('qt-' + item.id); if (el) el.src = e.target.result; };
  r.readAsDataURL(item.file);

  const img = new Image();
  img.onload = () => {
    const d = document.getElementById('qdm-' + item.id);
    if (d) d.textContent = img.width + '×' + img.height;
    URL.revokeObjectURL(img.src);
  };
  img.src = URL.createObjectURL(item.file);
}

function syncQ() {
  document.getElementById('qCount').textContent = queue.length + (queue.length === 1 ? ' file' : ' files');
  document.getElementById('runBtn').disabled = queue.length === 0;
}

function clearQueue() {
  queue = [];
  document.getElementById('queueList').innerHTML = '<div class="empty" id="emptyMsg">No images queued · drop files above to begin</div>';
  syncQ();
}

function setQS(id, cls, txt) {
  const e = document.getElementById('qs-' + id);
  if (e) { e.className = 'qs ' + cls; e.textContent = txt; }
}

function setPB(id, show, pct) {
  const pb = document.getElementById('qpb-' + id), pbr = document.getElementById('qpbr-' + id);
  if (pb) pb.classList.toggle('on', show);
  if (pbr) pbr.style.width = pct + '%';
}

function log(msg, cls = '') {
  const w = document.getElementById('logWrap');
  w.classList.add('on');
  const d = document.createElement('div');
  d.className = 'log-line ' + cls;
  d.textContent = '» ' + msg;
  w.appendChild(d);
  w.scrollTop = w.scrollHeight;
}

async function runPipeline() {
  if (!queue.length) return;
  results = [];
  document.getElementById('resGrid').innerHTML = '';
  document.getElementById('resultsSection').style.display = 'none';
  document.getElementById('logWrap').innerHTML = '';
  document.getElementById('logWrap').classList.remove('on');
  document.getElementById('runBtn').disabled = true;

  const cfg = {
    factor: parseFloat(document.getElementById('upscaleFactor').value),
    method: document.getElementById('upscaleMethod').value,
    shopify: parseInt(document.getElementById('shopifySize').value),
    quality: parseInt(document.getElementById('webpQ').value) / 100,
    maxKB: parseInt(document.getElementById('maxKB').value),
    bgSens: parseInt(document.getElementById('bgSens').value) || 80,
    feather: parseInt(document.getElementById('bgFeather').value) || 5,
    smartCropW: parseInt(document.getElementById('smartCropW').value) || 1024,
    smartCropH: parseInt(document.getElementById('smartCropH').value) || 1024,
    extendW: parseInt(document.getElementById('extendW').value) || 1200,
    extendH: parseInt(document.getElementById('extendH').value) || 1200,
    extendAlign: document.getElementById('extendAlign').value,
    extendBlend: parseInt(document.getElementById('extendBlend').value) || 24,
  };

  const stepCounts = { 1: 3, 2: 4, 3: 2, 4: 3 };
  const total = stepCounts[flow];

  for (const item of queue) {
    setQS(item.id, 'sp', 'PROCESSING');
    setPB(item.id, true, 0);
    log(`Processing: ${item.name}`);

    try {
      let canvas = await loadCanvas(item.file);
      let step = 0;

      if (flow === 4) {
        // Extender logic (unchanged)
        pipeStep(step, 'running');
        log(`  → extending canvas...`, 'warn');
        canvas = extendCanvas(canvas, cfg.extendW, cfg.extendH, cfg.extendAlign);
        pipeStep(step, 'done'); step++; setPB(item.id, true, Math.round(step / total * 100));

        pipeStep(step, 'running');
        log(`  → filling edges...`, 'warn');
        canvas = fillExtendedEdges(canvas, cfg.extendW, cfg.extendH, cfg.extendAlign, cfg.extendBlend);
        pipeStep(step, 'done'); step++; setPB(item.id, true, Math.round(step / total * 100));

      } else if (flow === 3) {
        pipeStep(step, 'running');
        log(`  → smart crop to ${cfg.smartCropW}×${cfg.smartCropH}...`, 'warn');
        canvas = smartCrop(canvas, cfg);
        pipeStep(step, 'done'); step++; setPB(item.id, true, Math.round(step / total * 100));
        log(`  ✓ cropped → ${canvas.width}×${canvas.height}`, 'ok');

      } else {
        if (flow === 2) {
          pipeStep(step, 'running');
          log('  → AI background removal...', 'warn');
          canvas = await removeBackgroundAI(canvas, cfg.feather, cfg.bgSens);
          pipeStep(step, 'done'); step++; setPB(item.id, true, Math.round(step / total * 100));
        }

        pipeStep(step, 'running');
        log(`  → upscaling ×${cfg.factor}...`, 'warn');
        canvas = await upscale(canvas, cfg.factor, cfg.method);
        pipeStep(step, 'done'); step++; setPB(item.id, true, Math.round(step / total * 100));

        pipeStep(step, 'running');
        log(`  → shopify resize...`, 'warn');
        canvas = shopifyResize(canvas, cfg.shopify);
        pipeStep(step, 'done'); step++; setPB(item.id, true, Math.round(step / total * 100));
      }

      // WebP
      pipeStep(step, 'running');
      log('  → encoding WebP...', 'warn');
      const { blob, dataURL } = await encodeWebP(canvas, cfg.quality, cfg.maxKB);
      pipeStep(step, 'done'); setPB(item.id, true, 100);

      const prefix = flow === 4 ? 'extended' : flow === 3 ? 'smartcrop' : flow === 2 ? 'nobg' : 'shopify';
      const base = item.name.replace(/\.[^.]+$/, '');
      const out = { id: item.id, name: `${prefix}_${base}.webp`, blob, dataURL, orig: item.size, size: blob.size, dims: `${canvas.width}×${canvas.height}` };
      results.push(out);
      addResult(out);
      setQS(item.id, 'sd', 'DONE');
      log(`  ✓ ${out.name} — ${(blob.size / 1024).toFixed(0)} KB`, 'ok');

    } catch (err) {
      setQS(item.id, 'se', 'ERROR'); log('  ✗ ' + err.message, 'err'); console.error(err);
    }
    setPB(item.id, false, 0); resetTrack();
  }

  document.getElementById('statsCount').textContent = results.length;
  document.getElementById('resultsSection').style.display = 'block';
  document.getElementById('resCount').textContent = results.length + ' file' + (results.length !== 1 ? 's' : '');
  document.getElementById('runBtn').disabled = false;
  log(`Done. ${results.length} file(s) ready.`, 'ok');
}

// FIXED SMART CROP
function smartCrop(canvas, cfg) {
  const targetW = cfg.smartCropW;
  const targetH = cfg.smartCropH;

  const out = document.createElement('canvas');
  out.width = targetW;
  out.height = targetH;
  const ctx = out.getContext('2d');

  // Calculate scale to fit inside target (contain)
  const scale = Math.min(targetW / canvas.width, targetH / canvas.height);
  const newW = Math.round(canvas.width * scale);
  const newH = Math.round(canvas.height * scale);

  const x = Math.floor((targetW - newW) / 2);
  const y = Math.floor((targetH - newH) / 2);

  ctx.drawImage(canvas, x, y, newW, newH);
  return out;
}

async function loadCanvas(file) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width  = img.naturalWidth;
      c.height = img.naturalHeight;
      c.getContext('2d').drawImage(img, 0, 0);
      URL.revokeObjectURL(img.src);
      res(c);
    };
    img.onerror = rej;
    img.src = URL.createObjectURL(file);
  });
}

async function removeBackgroundAI(srcCanvas, featherRadius = 5, alphaThreshold = 80) {
  if (!imglyRemoveBackground) {
    log('  → loading AI model (first run only)...', 'warn');
    const mod = await import('https://esm.sh/@imgly/background-removal@1.7.0');
    imglyRemoveBackground = mod.default || mod.removeBackground;
  }

  const srcBlob = await new Promise(res => srcCanvas.toBlob(res, 'image/png'));
  const outBlob = await imglyRemoveBackground(srcBlob);

  const bmp = await createImageBitmap(outBlob);
  const outCanvas = document.createElement('canvas');
  outCanvas.width  = srcCanvas.width;
  outCanvas.height = srcCanvas.height;
  const ctx = outCanvas.getContext('2d');
  ctx.drawImage(bmp, 0, 0);
  bmp.close();

  // Alpha threshold clamp
  let imgData = ctx.getImageData(0, 0, outCanvas.width, outCanvas.height);
  const data  = imgData.data;
  const lo    = alphaThreshold, hi = 255 - alphaThreshold;
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

function gaussBlurAlpha(alpha, W, H, radius) {
  const sigma = radius * 0.45 + 0.5;
  const ksize = Math.ceil(radius * 2.5) * 2 + 1;
  const kern  = []; let ks = 0;
  for (let i = 0; i < ksize; i++) {
    const x = i - Math.floor(ksize / 2);
    const v = Math.exp(-(x * x) / (2 * sigma * sigma));
    kern.push(v); ks += v;
  }
  for (let i = 0; i < ksize; i++) kern[i] /= ks;

  const half = Math.floor(ksize / 2);
  const tmp  = new Float32Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    let v = 0;
    for (let k = 0; k < ksize; k++) {
      const sx = Math.max(0, Math.min(W - 1, x + k - half));
      v += kern[k] * alpha[y * W + sx];
    }
    tmp[y * W + x] = v;
  }
  const out = new Float32Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    let v = 0;
    for (let k = 0; k < ksize; k++) {
      const sy = Math.max(0, Math.min(H - 1, y + k - half));
      v += kern[k] * tmp[sy * W + x];
    }
    out[y * W + x] = v;
  }
  return out;
}

// ─── Lanczos-3 Upscale ─────────────────────────────────────────────────────
function lanczos3(x) {
  if (x === 0) return 1;
  if (Math.abs(x) >= 3) return 0;
  const p = Math.PI * x;
  return (Math.sin(p) / p) * (Math.sin(p / 3) / (p / 3));
}

async function upscale(canvas, factor, method) {
  const nW = Math.round(canvas.width  * factor);
  const nH = Math.round(canvas.height * factor);

  if (method === 'bicubic' || factor <= 1) {
    const out = document.createElement('canvas');
    out.width = nW; out.height = nH;
    const ctx = out.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(canvas, 0, 0, nW, nH);
    return out;
  }

  // Full Lanczos-3 implementation
  const src = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
  const sd   = src.data, SW = canvas.width, SH = canvas.height;
  const out  = document.createElement('canvas');
  out.width  = nW; out.height = nH;
  const oc   = out.getContext('2d');
  const dst  = oc.createImageData(nW, nH);
  const dd   = dst.data;

  // Pre-compute x kernel weights
  const xK = new Array(nW);
  for (let dx = 0; dx < nW; dx++) {
    const sx = (dx + 0.5) / factor - 0.5;
    const base = Math.floor(sx) - 2;
    const w = []; let ws = 0;
    for (let k = 0; k < 6; k++) { const v = lanczos3(sx - (base + k)); w.push(v); ws += v; }
    xK[dx] = { base, w, ws: ws || 1 };
  }

  const TILE = 48;
  for (let ty = 0; ty < nH; ty += TILE) {
    for (let dy = ty; dy < Math.min(ty + TILE, nH); dy++) {
      const sy  = (dy + 0.5) / factor - 0.5;
      const yb  = Math.floor(sy) - 2;
      const yw  = []; let yws = 0;
      for (let k = 0; k < 6; k++) { const v = lanczos3(sy - (yb + k)); yw.push(v); yws += v; }
      yws = yws || 1;

      for (let dx = 0; dx < nW; dx++) {
        const { base: xb, w: xw, ws: xws } = xK[dx];
        let R = 0, G = 0, B = 0, A = 0;
        for (let ky = 0; ky < 6; ky++) {
          const sry  = Math.max(0, Math.min(SH - 1, yb + ky));
          const ywk  = yw[ky] / yws;
          for (let kx = 0; kx < 6; kx++) {
            const srx = Math.max(0, Math.min(SW - 1, xb + kx));
            const w   = ywk * xw[kx] / xws;
            const pi  = (sry * SW + srx) * 4;
            const srcA = sd[pi + 3] / 255;
            R += sd[pi]     * srcA * w;
            G += sd[pi + 1] * srcA * w;
            B += sd[pi + 2] * srcA * w;
            A += srcA * w;
          }
        }
        const pi2 = (dy * nW + dx) * 4;
        if (A > 1e-6) {
          dd[pi2]     = Math.max(0, Math.min(255, (R / A) + 0.5) | 0);
          dd[pi2 + 1] = Math.max(0, Math.min(255, (G / A) + 0.5) | 0);
          dd[pi2 + 2] = Math.max(0, Math.min(255, (B / A) + 0.5) | 0);
          dd[pi2 + 3] = Math.max(0, Math.min(255, A * 255 + 0.5) | 0);
        }
      }
    }
    await new Promise(r => setTimeout(r, 0));
  }
  oc.putImageData(dst, 0, 0);
  return out;
}

function shopifyResize(canvas, maxDim) {
  const r = Math.min(maxDim / canvas.width, maxDim / canvas.height, 1);
  if (r >= 1) return canvas;
  const out = document.createElement('canvas');
  out.width  = Math.round(canvas.width  * r);
  out.height = Math.round(canvas.height * r);
  const ctx  = out.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(canvas, 0, 0, out.width, out.height);
  return out;
}

function encodeWebP(canvas, quality, maxKB) {
  return new Promise(res => {
    let q = quality;
    const go = () => canvas.toBlob(blob => {
      if (blob.size > maxKB * 1024 && q > 0.2) { q = Math.max(q - 0.04, 0.2); go(); }
      else {
        const r = new FileReader();
        r.onload = () => res({ blob, dataURL: r.result });
        r.readAsDataURL(blob);
      }
    }, 'image/webp', q);
    go();
  });
}

// ─── Image Extender ────────────────────────────────────────────────────────
function extendCanvas(srcCanvas, targetW, targetH, align) {
  const W = Math.max(targetW, srcCanvas.width);
  const H = Math.max(targetH, srcCanvas.height);
  const out = document.createElement('canvas');
  out.width = W; out.height = H;
  const ctx = out.getContext('2d');
  const { ox, oy } = getOffset(srcCanvas.width, srcCanvas.height, W, H, align);
  out._srcW = srcCanvas.width; out._srcH = srcCanvas.height;
  out._ox = ox; out._oy = oy;
  ctx.clearRect(0, 0, W, H);
  ctx.drawImage(srcCanvas, ox, oy);
  return out;
}

function fillExtendedEdges(canvas, targetW, targetH, align, blendRadius) {
  const W   = canvas.width, H = canvas.height;
  const ctx = canvas.getContext('2d');
  const imgData = ctx.getImageData(0, 0, W, H);
  const data    = imgData.data;
  const ox = canvas._ox || 0, oy = canvas._oy || 0;
  const srcW = canvas._srcW || W, srcH = canvas._srcH || H;

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const pi = (y * W + x) * 4;
      const inOrig = (x >= ox && x < ox + srcW && y >= oy && y < oy + srcH);
      if (inOrig) continue;
      const cx = Math.max(ox, Math.min(ox + srcW - 1, x));
      const cy = Math.max(oy, Math.min(oy + srcH - 1, y));
      const sp = (cy * W + cx) * 4;
      data[pi] = data[sp]; data[pi+1] = data[sp+1]; data[pi+2] = data[sp+2]; data[pi+3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);
  if (blendRadius > 0) blendEdgeBoundary(ctx, ox, oy, srcW, srcH, W, H, blendRadius);
  return canvas;
}

function blendEdgeBoundary(ctx, ox, oy, srcW, srcH, W, H, radius) {
  const imgData = ctx.getImageData(0, 0, W, H);
  const data    = imgData.data;
  for (let y = oy; y < oy + srcH; y++) {
    for (let x = ox; x < ox + srcW; x++) {
      const dx = Math.min(x - ox, ox + srcW - 1 - x);
      const dy = Math.min(y - oy, oy + srcH - 1 - y);
      const d  = Math.min(dx, dy);
      if (d >= radius) continue;
      const t  = d / radius;
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

function getOffset(srcW, srcH, W, H, align) {
  const cx = Math.round((W - srcW) / 2);
  const cy = Math.round((H - srcH) / 2);
  const bx = W - srcW, by = H - srcH;
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
    default:              ox = cx; oy = cy; break; // center
  }
  return { ox: Math.max(0, ox), oy: Math.max(0, oy) };
}

// ─── Results ───────────────────────────────────────────────────────────────
function addResult(r) {
  const s    = Math.round((1 - r.size / r.orig) * 100);
  const card = document.createElement('div');
  card.className = 'rc';
  card.innerHTML = `
    <img class="rc-img" src="${r.dataURL}" alt="${r.name}">
    <div class="rc-body">
      <div class="rc-name">${r.name}</div>
      <div class="rc-stats">
        <span class="pill py">${(r.size / 1024).toFixed(0)} KB</span>
        <span class="pill ${s > 0 ? 'pg' : 'pr'}">${s > 0 ? '↓' : '↑'}${Math.abs(s)}%</span>
        <span class="pill pg">${r.dims}</span>
      </div>
      <button class="dl-btn" onclick="dlOne('${r.id}')">⬇ DOWNLOAD</button>
    </div>`;
  document.getElementById('resGrid').appendChild(card);
}

function dlOne(id) {
  const r = results.find(x => String(x.id) === String(id));
  if (!r) return;
  const a = document.createElement('a');
  a.href = URL.createObjectURL(r.blob);
  a.download = r.name;
  a.click();
}

async function downloadAll() {
  if (!results.length) return;
  const zip = new JSZip();
  results.forEach(r => zip.file(r.name, r.blob));
  const blob = await zip.generateAsync({ type: 'blob' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'shopify_pipeline.zip';
  a.click();
}

// ─── Presets ───────────────────────────────────────────────────────────────
function applyPreset(p) {
  document.querySelectorAll('.preset-btn').forEach(b => b.classList.toggle('active', b.dataset.preset === p));
  if (p === 'quick') {
    document.getElementById('upscaleMethod').value = 'bicubic';
    document.getElementById('upscaleFactor').value = '2';
    document.getElementById('webpQ').value = 75; document.getElementById('qv').textContent = 75;
    document.getElementById('maxKB').value = 300;
  } else if (p === 'balanced') {
    document.getElementById('upscaleMethod').value = 'lanczos';
    document.getElementById('upscaleFactor').value = '2';
    document.getElementById('webpQ').value = 85; document.getElementById('qv').textContent = 85;
    document.getElementById('maxKB').value = 500;
  } else {
    document.getElementById('upscaleMethod').value = 'lanczos';
    document.getElementById('upscaleFactor').value = '3';
    document.getElementById('webpQ').value = 95; document.getElementById('qv').textContent = 95;
    document.getElementById('maxKB').value = 2000;
  }
}

// Init
renderTrack();