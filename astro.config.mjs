// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import preact from '@astrojs/preact';

// https://astro.build/config
export default defineConfig({
  site: 'https://malogermond.github.io',
  base: '/sketching-tools',
  vite: {
    plugins: [tailwindcss()],
    build: {
      chunkSizeWarningLimit: 1000,
    },
  },
  integrations: [preact()],
});
