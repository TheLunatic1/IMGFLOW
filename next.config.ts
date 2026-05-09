import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Allow the @imgly/background-removal dynamic import from esm.sh
  // to load WASM assets from it's CDN
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Cross-Origin-Embedder-Policy',  value: 'require-corp' },
          { key: 'Cross-Origin-Opener-Policy',    value: 'same-origin'  },
        ],
      },
    ];
  },
};

export default nextConfig;
