import { defineConfig } from 'astro/config';

// Trang tĩnh. CSS tách tệp, script duy nhất là public/js/loc.js (tệp tĩnh) để CSP
// `style-src 'self'; script-src 'self'` cho qua mà không cần 'unsafe-inline'.
export default defineConfig({
  site: 'https://cwico.tsudev.com',
  trailingSlash: 'always',
  compressHTML: true,
  build: { format: 'directory', inlineStylesheets: 'never' },
  vite: {
    server: { fs: { allow: ['..'] } },
    build: { assetsInlineLimit: 0 },
  },
});
