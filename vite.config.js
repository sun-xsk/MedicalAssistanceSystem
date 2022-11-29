import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/projects': {
        target: '192.168.112.100:50000', 
        changeOrigin: true, //支持跨域
      }
    }
  }
})
