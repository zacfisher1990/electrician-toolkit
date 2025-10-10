import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => {
  const base = command === 'serve' ? '/' : '/electrician-toolkit/';
  
  return {
    plugins: [react()],
    base: base,
    build: {
      outDir: 'dist'
    }
  }
})