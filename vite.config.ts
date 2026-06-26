import { defineConfig } from 'vite';

export default defineConfig({
  base: '/checkpoint-web/',
  server: { port: 5173 },
  preview: { port: 4173 },
});
