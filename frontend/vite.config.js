import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const animalsProxy = {
  '/animals': {
    target: 'http://localhost:3000',
    changeOrigin: true,
  },
}

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: animalsProxy,
  },
  preview: {
    proxy: animalsProxy,
  },
})
