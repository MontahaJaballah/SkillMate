import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'window', // Ajoutez cette ligne
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis', // Et cette ligne
      },
    },
  },
});