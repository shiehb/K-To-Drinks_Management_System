import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    proxy: mode === 'development' ? {
      '/api': {
        target: 'https://k-to-drinks-management-system.onrender.com',
        changeOrigin: true,
      },
    } : undefined,
  },
  build: {
    outDir: 'dist',
  },
}))
