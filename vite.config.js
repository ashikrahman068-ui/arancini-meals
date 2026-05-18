import base44 from "@base44/vite-plugin"
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    base44({
      legacySDKImports: process.env.BASE44_LEGACY_SDK_IMPORTS === 'true'
    }),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png', 'icons/*.svg'],
      
      // We manage manifest.json ourselves in /public
      manifest: false,

      workbox: {
        // Cache app shell assets
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        
        runtimeCaching: [
          // Cache meal images from Supabase (stale-while-revalidate)
          {
            urlPattern: /^https:\/\/qtrypzzcjebvfcihiynt\.supabase\.co\/storage\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'arancini-images',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // Cache API calls - network-first with cache fallback
          {
            urlPattern: /^https:\/\/.*\.base44\.com\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'arancini-api',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 5, // 5 min
              },
              networkTimeoutSeconds: 10,
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],

        skipWaiting: true,
        clientsClaim: true,
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/, /^\/base44/],
      },

      devOptions: {
        enabled: true,
        type: 'module',
      },
    }),
  ],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
})