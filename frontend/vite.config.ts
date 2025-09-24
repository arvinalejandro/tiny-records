import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // proxy /api to your backend (backend should run on :3000)
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
});
