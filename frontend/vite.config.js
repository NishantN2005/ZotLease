import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // Treat <mapbox-address-autofill> as a custom element
          isCustomElement: (tag) => tag === 'mapbox-address-autofill'
        }
      }
    }),
    vueJsx(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server:{
    port:5173,
    host: true, // This makes the server accessible externally
    allowedHosts: ['www.zotlease.org'],
  },
  build: {
    outDir: 'dist', // Ensure the output directory is set correctly
  },
})
