import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-src-assets',
      closeBundle() {
        const src = path.resolve(__dirname, 'src/assets/images')
        const dest = path.resolve(__dirname, 'dist/src/assets/images')
        if (fs.existsSync(src)) {
          fs.mkdirSync(dest, { recursive: true })
          fs.cpSync(src, dest, { recursive: true })
        }
      }
    }
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  }
})
