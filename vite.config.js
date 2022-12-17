import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/projects': {
        target: 'http://43.142.168.114:8001/', 
        changeOrigin: true, //支持跨域
      }
    }
  }
})
