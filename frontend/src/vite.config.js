import { defineConfig, loadEnv } from "vite"
import react from "@vitejs/plugin-react"
import { resolve } from "path"

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), "")

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": resolve(__dirname, "./src"),
      },
    },
    server: {
      port: 5173,
      // Proxy API requests in development to avoid CORS issues
      proxy: {
        "/api": {
          target: env.VITE_API_URL || "http://localhost:8000",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },
    build: {
      // Generate source maps for production build
      sourcemap: true,
      // Optimize bundle size
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["react", "react-dom", "react-router-dom"],
            utils: ["axios"],
          },
        },
      },
    },
    // Define global constants for the app
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    },
  }
})

