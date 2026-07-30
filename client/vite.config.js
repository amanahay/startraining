import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, path.resolve(here, '..'), '');
  const apiTarget = `http://localhost:${env.PORT || 3100}`;
  return {
    root: here,
    envDir: path.resolve(here, '..'),
    plugins: [vue()],
    publicDir: path.join(here, 'public'),
    build: {
      outDir: path.resolve(here, '..', 'dist'),
      emptyOutDir: true
    },
    server: {
      // Gunakan port non-standar agar tidak berbenturan dengan proyek Vite lain.
      port: Number(env.VITE_PORT || 18473),
      strictPort: true,
      proxy: {
        '/api': apiTarget,
        '/uploads': apiTarget,
        '/sitemap.xml': apiTarget,
        '/robots.txt': apiTarget
      }
    }
  };
});
