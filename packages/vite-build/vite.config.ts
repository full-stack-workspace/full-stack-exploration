import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { analyzer } from 'vite-bundle-analyzer'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss(), analyzer()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 5175
  },
  build: {
    target: 'es2020',
    minify: 'esbuild',
    sourcemap: true,
    chunkSizeWarningLimit: 1000
  }
})
