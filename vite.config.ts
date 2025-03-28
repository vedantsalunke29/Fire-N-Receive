import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  build: {
    minify: 'terser', 
    terserOptions: {
      compress: {
        drop_console: true, 
        dead_code: true, 
        unused: true, 
        passes: 3, 
      },
      output: {
        comments: false, 
      },
    },
    sourcemap: false, 
  },
})
