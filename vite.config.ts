import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate', // यह सुनिश्चित करेगा कि ऐप हमेशा अपडेटेड रहे
      manifest: {
        name: 'Sahil Master App',
        short_name: 'SahilMaster',
        description: 'Risk Management and Ledger App',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone', // यह इसे असली ऐप की तरह फुल-स्क्रीन में खोलेगा (बिना ब्राउज़र के)
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})
