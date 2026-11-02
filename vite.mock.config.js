import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

// Local testing only: swaps Firebase for an in-browser stand-in shared across tabs.
const dev = (f) => fileURLToPath(new URL(`./src/dev/${f}`, import.meta.url));
export default defineConfig({
  plugins: [react()],
  base: '/dkagame/',
  build: { outDir: 'dist-mock' },
  resolve: {
    alias: {
      'firebase/database': dev('fakeDb.js'),
      'firebase/auth': dev('fakeAuth.js'),
      'firebase/app': dev('fakeAuth.js'),
    },
  },
});
