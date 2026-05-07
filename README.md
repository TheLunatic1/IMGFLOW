# IMGFLOW — Shopify Image Pipeline

**100% local • Zero API • Blazing fast** image optimization tool built for Shopify merchants.

![IMGFLOW](https://via.placeholder.com/800x400/0a0a0f/ c6f135?text=IMGFLOW+Pro+Pipeline)

---

## ✨ Features

- **4 Smart Pipelines**:
  - Standard (Upscale → Compress → WebP)
  - AI Background Removal (using U²-Net)
  - Smart Crop (with custom target width & height)
  - Image Extender (Canvas extension with edge fill — no AI)

- **High-Quality Upscaling** — Custom Lanczos-3 algorithm
- **Shopify Optimized** — Auto resize to 2048px / 1024px / etc.
- **WebP Conversion** with intelligent quality & size control
- **Fully Local** — Nothing leaves your browser
- **Beautiful Dark UI** with real-time progress
- **Batch Processing** — Handle multiple images at once

---

## 🚀 Live Demo

[Try IMGFLOW →](https://imgflow2000.vercel.app) *(update after deployment)*

---

## 📸 Screenshots

*(Add screenshots here after deployment)*

---

## 🛠️ How to Use

1. Drop your product images (or click to upload)
2. Choose a pipeline (Standard / No Background / Smart Crop / Extender)
3. Adjust settings (optional)
4. Click **"Run Pipeline"**
5. Download individual files or all as ZIP

---

## Key Settings

| Setting              | Description |
|---------------------|-----------|
| **Upscale Factor**   | 1.5× / 2× / 3× / 4× |
| **Smart Crop**       | Set exact target Width × Height |
| **AI BG Removal**    | Alpha Threshold + Edge Feather |
| **Image Extender**   | Target dimensions + alignment + blend |
| **WebP Quality**     | 40–100 with max KB limit |

---

## Tech Stack

- Vanilla HTML + CSS + JavaScript
- Custom Lanczos-3 Upscaler
- `@imgly/background-removal` (WASM)
- JSZip for batch download
- Tailwind CSS (optional)

---

## Local Development

```bash
# 1. Clone the repo
git clone https://github.com/yourusername/imgflow.git
cd imgflow

# 2. Open index.html in browser
# Just double-click the file or use Live Server
```

---

## Deploy on Vercel (Recommended)

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Click **Deploy**

Done. Instant global CDN + HTTPS.

---

## Roadmap

- [ ] Web Worker support for larger images
- [ ] PWA (installable app)
- [ ] Save presets
- [ ] More AI features
- [ ] Dark/Light mode toggle

---

## License

MIT License — Feel free to use commercially.

---

**Made with ❤️ for Shopify store owners**

---

### Star this repo if you find it useful! ⭐