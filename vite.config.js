import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// base se ajusta en build para funcionar tanto en raíz como en GitHub Pages
// (sobreescribible con la variable de entorno VITE_BASE).
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: process.env.VITE_BASE || '/',
})
