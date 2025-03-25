import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    historyApiFallback: true, // Ensures client-side routing works
  },
  build: {
    outDir: 'dist', // Ensures proper build output
  }
})
