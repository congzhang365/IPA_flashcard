import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'IPA365 Flashcards',
        short_name: 'IPA365',
        description: 'Master the International Phonetic Alphabet with interactive flashcards, sounds and quizzes.',
        id: './',
        start_url: './',
        scope: './',
        display: 'standalone',
        background_color: '#fcfdfd',
        theme_color: '#FC7B5D',
        icons: [
          { src: './icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: './icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: './icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: /\/audio\/.*\.mp3$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'ipa365-audio',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /\/fonts\/.*\.woff2$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'ipa365-fonts',
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  base: './', // Ensures assets are loaded correctly on GitHub Pages
  build: {
    outDir: 'dist',
  },
});
