import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      // Lets the frontend call a same-origin "/api" path during `npm run dev`,
      // forwarding to the backend so we don't need CORS configured for local dev.
      '/api': {
        target: process.env.VITE_DEV_API_PROXY || 'http://localhost:5000',
        changeOrigin: true,
      },
      '/booking-api': {
        target: process.env.VITE_DEV_BOOKING_API_PROXY || 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/booking-api/, ''),
      },
    },
  },
  preview: {
    port: 4173,
    host: true,
  },
});
