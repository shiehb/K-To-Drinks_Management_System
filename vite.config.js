import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // Default Vite port
    open: true, // Auto open browser
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000', // Django API URL
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist', // Ensures proper build output
  },
})
