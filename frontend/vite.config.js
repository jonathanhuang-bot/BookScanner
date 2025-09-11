import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/analyze': 'http://localhost:5000',
      '/process-goodreads': 'http://localhost:5000',
      '/history': 'http://localhost:5000',
      '/saved-books': 'http://localhost:5000',
      '/health': 'http://localhost:5000'
    }
  }
})
