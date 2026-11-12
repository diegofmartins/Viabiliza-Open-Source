import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(({command, mode}) => {
  // Dev mode and standard preview must use '/' to ensure assets resolve properly.
  // GitHub Pages build on GitHub Actions will use the repository suffix.
  const isGitHubActions = process.env.GITHUB_ACTIONS === 'true' || !!process.env.GITHUB_WORKFLOW;
  const base = command === 'serve' 
    ? '/' 
    : (process.env.BASE_PATH || (isGitHubActions ? '/ETP_Digital_v2/' : '/'));

  return {
    plugins: [react(), tailwindcss()],
    base: base,
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
