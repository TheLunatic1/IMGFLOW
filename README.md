# IMGFLOW — Shopify Image Pipeline

> **100% local · Zero API · Blazing fast** image optimization built for Shopify merchants.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?style=flat-square&logo=tailwindcss)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

---

## What it does

IMGFLOW processes product images entirely in the browser — no server uploads, no third-party APIs, no data ever leaves your machine. Drop images in, pick a pipeline, click Run.

### Preview
![Book Haven Preview](/preview.png) 

---

### Pipelines

| # | Pipeline | Steps |
|---|---|---|
| 01 | **Standard** | Lanczos-3 Upscale → Shopify Resize → WebP |
| 02 | **No Background** | AI BG Remove → Upscale → Shopify Resize → WebP |
| 03 | **Crop & Extend** | Smart Crop → Extend Canvas → Fill Edges → WebP |

---

## Tech Stack

| Layer | Library |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 + CSS custom properties |
| Drag & Drop | react-dropzone |
| ZIP download | fflate |
| BG Removal | @imgly/background-removal (loaded dynamically from esm.sh) |
| Fonts | Syne + JetBrains Mono via next/font/google |
| Image processing | Custom Lanczos-3, canvas extender, smart crop (all browser-native) |

---

## Project Structure

```
imgflow/
├── app/
│   ├── layout.tsx          ← Root layout, fonts, global styles
│   ├── page.tsx            ← Main app shell, wires all components
│   └── globals.css         ← CSS variables, Tailwind base, animations
├── components/
│   ├── Header.tsx          ← Logo, tagline, processed counter
│   ├── FlowTabs.tsx        ← Pipeline selector (3 tabs)
│   ├── PipelineTrack.tsx   ← Step-by-step progress indicator
│   ├── DropZone.tsx        ← react-dropzone file input
│   ├── SettingsGrid.tsx    ← All settings + presets, conditionally rendered by flow
│   ├── QueueList.tsx       ← File queue with thumbnails + progress bars
│   ├── LogPanel.tsx        ← Live processing log
│   └── ResultsGrid.tsx     ← Output previews + download buttons
├── lib/
│   ├── pipeline.ts         ← All image processing (Lanczos, extender, crop, BG removal)
│   └── types.ts            ← Shared TypeScript types + constants
├── hooks/
│   └── usePipeline.ts      ← All state (useReducer) + pipeline orchestration
├── next.config.ts          ← COEP/COOP headers for BG removal WASM
├── postcss.config.mjs
└── tsconfig.json
```

---

## Getting Started

### Requirements

- Node.js v18.17 or later
- npm v9+

### Local development

```bash
# 1. Clone the repo
git clone https://github.com/your-username/imgflow.git
cd imgflow

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production build

```bash
npm run build
npm start
```

---

## Deploy to Vercel

1. Push your repo to GitHub
2. Import the project at [vercel.com/new](https://vercel.com/new)
3. Set **Framework Preset** to **Next.js**
4. Leave **Output Directory** blank (do not set it to `public`)
5. Click **Deploy**

> The `next.config.ts` file already sets the required `Cross-Origin-Embedder-Policy` and `Cross-Origin-Opener-Policy` headers needed for the background removal WASM to work in production.

---

## Settings Reference

| Setting | Description |
|---|---|
| Upscale Method | Lanczos-3 (sharpest) or Bicubic (faster) |
| Upscale Factor | 1.5×, 2×, 3×, 4× |
| Shopify Max Dimension | 800 / 1024 / 2048 / 4472px |
| WebP Quality | 40–100 (auto-reduces to hit max KB target) |
| Max Output KB | Hard ceiling; quality is reduced automatically if exceeded |
| Rename Pattern | `{name}` keeps original name, `product_{n}` for numbered output |
| Alpha Threshold | BG removal only — controls edge hardness |
| Edge Feather | BG removal only — softens the cut edge |
| Target Width / Height | Crop & Extend — output canvas dimensions |
| Image Position | Crop & Extend — where the original sits on the new canvas |
| Edge Blend Radius | Crop & Extend — how far the edge fill blends inward |

### Presets

| Preset | Method | Factor | Quality | Max KB |
|---|---|---|---|---|
| ⚡ Quick | Bicubic | 2× | 75 | 300 |
| ⚖ Balanced | Lanczos-3 | 2× | 85 | 500 |
| 💎 Max Quality | Lanczos-3 | 3× | 95 | 2000 |

---

## Notes

- **Background removal** loads the AI model from `esm.sh` on first use only. Subsequent runs in the same session use the cached model.
- **Lanczos-3 on large images** is intentionally slow at 3× or 4× — this is expected. Use Bicubic preset for faster batch processing.
- All processing runs on the main thread via Canvas API. No Web Workers are used — the UI may feel unresponsive during heavy upscaling of large images. This is a known limitation.

---

## License

MIT