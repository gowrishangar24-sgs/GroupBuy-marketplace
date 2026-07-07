import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      usePolling: true, // Forces Vite to watch for your React code changes
    },
    proxy: {
      // Lets relative "/api/..." calls work in local dev even with no VITE_API_BASE_URL set,
      // matching the same relative-path behavior used in production.
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})