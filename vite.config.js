import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base se ajusta en build para funcionar tanto en raíz como en GitHub Pages
// (sobreescribible con la variable de entorno VITE_BASE).
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE || '/',
})
