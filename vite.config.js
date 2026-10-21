import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' ให้ deploy ใต้ path ของ GitHub Pages (username.github.io/repo) ได้
export default defineConfig({
  plugins: [react()],
  base: './',
})
