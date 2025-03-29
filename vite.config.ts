import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import compression from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    react(),
    // Gzip compression
    compression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 10240, // 10kb
      deleteOriginFile: false,
      verbose: true,
    }),
    // Brotli compression (typically better than gzip)
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 10240, // 10kb
      deleteOriginFile: false,
      verbose: true,
    }),
  ],
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'lucide': ['lucide-react']
        }
      }
    }
  }
})