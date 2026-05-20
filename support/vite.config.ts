import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@fe-common': path.resolve(__dirname, '../fe-common/src'),
    },
  },
  server: {
    host: true,
    port: process.env.PORT ? parseInt(process.env.PORT) : 5173,
    strictPort: true,
  },
})
