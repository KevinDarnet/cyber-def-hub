import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Rutas relativas para compatibilidad directa con GitHub Pages en cualquier repositorio
  base: './',
  plugins: [react()],
  server: {
    port: 5173,
  },
});
