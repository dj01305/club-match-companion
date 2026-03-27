import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': process.env.VITE_BACKEND_URL || 'http://localhost:3000',
      '/auth': process.env.VITE_BACKEND_URL || 'http://localhost:3000',
    },
  },
  test: {
    environment: 'jsdom',           // fake browser environment
    globals: true,                  // no need to import describe/test/expect
    setupFiles: './src/test.setup.ts',
  },
});
