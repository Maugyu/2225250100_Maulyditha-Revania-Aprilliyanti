import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath, URL } from 'node:url';

// Strategi cache mengikuti project-planning/technical/PWA_SPECIFICATION.md §3.2
const api = (path) => ({ url }) => url.pathname.startsWith(`/api/v1${path}`);

const apiProxy = { '/api': { target: 'http://127.0.0.1:8000', changeOrigin: true } };

export default defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  server: { port: 5173, proxy: apiProxy },
  preview: { port: 4173, proxy: apiProxy },
  build: {
    rollupOptions: {
      output: {
        manualChunks: { react: ['react', 'react-dom', 'react-router-dom'], katex: ['katex'] },
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: false,
      includeAssets: ['icons/apple-touch-icon.png', 'favicon.svg'],
      manifest: {
        name: 'JelajahGaris — Literasi Matematika',
        short_name: 'JelajahGaris',
        description: 'Belajar persamaan garis lurus dalam kehidupan sehari-hari bareng Gari si bebek.',
        lang: 'id',
        start_url: '/?source=pwa',
        scope: '/',
        display: 'standalone',
        orientation: 'any',
        background_color: '#F4FAF8',
        theme_color: '#FFD84D',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            urlPattern: ({ url, request }) =>
              request.method === 'GET' && (api('/modules')({ url }) || api('/activities')({ url })),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'content-v1',
              networkTimeoutSeconds: 3,
              expiration: { maxEntries: 120, maxAgeSeconds: 30 * 24 * 3600 },
            },
          },
          {
            urlPattern: ({ url, request }) =>
              request.method === 'GET' && (api('/me/progress')({ url }) || api('/me/resume')({ url })),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'user-v1',
              networkTimeoutSeconds: 3,
              expiration: { maxEntries: 10, maxAgeSeconds: 24 * 3600 },
            },
          },
          // Selain itu (asesmen, auth, peneliti, semua POST/PUT/PATCH) tidak di-cache = NetworkOnly.
        ],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.js'],
  },
});
