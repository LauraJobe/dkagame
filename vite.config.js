import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base must match the GitHub repo name for GitHub Pages: https://laurajobe.github.io/dkagame/
export default defineConfig({
  plugins: [react()],
  base: '/dkagame/',
});
