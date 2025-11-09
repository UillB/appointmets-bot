
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  css: {
    postcss: false, // Disable PostCSS since we're using TailwindCSS v4 with Vite plugin
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // CRITICAL: Set base path for production build to match /admin-panel route
  base: process.env.NODE_ENV === 'production' ? '/admin-panel/' : '/',
  build: {
    target: 'esnext',
    outDir: 'build',
  },
  server: {
    port: 4200,
    host: '0.0.0.0',
    open: false,
    strictPort: true,
    cors: true,
  },
});