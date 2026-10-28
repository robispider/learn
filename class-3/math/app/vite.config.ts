import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// three.js is only reached through the lazy 2.5-D renderers, so Rollup puts it in its own chunk.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: { target: 'es2020', chunkSizeWarningLimit: 1000 },
});
