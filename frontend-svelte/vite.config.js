import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte()],
  server: {
    port: 5173,
    proxy: {
      '/alunos': 'http://localhost:3000',
      '/cursos': 'http://localhost:3000',
    },
  },
  build: {
    outDir: '../frontend',
    emptyOutDir: true,
  },
})
