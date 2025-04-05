import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'build',
    target: 'esnext',
    assetsDir: 'assets',
  },
  server: {
    port: 3000,
  },
});