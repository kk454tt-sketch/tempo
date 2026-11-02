import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'node:url';
import { handleApiRequest } from './server/apiRouter.js';

const projectDir = path.dirname(fileURLToPath(import.meta.url));

function tempoBackendPlugin() {
  return {
    name: 'tempo-backend-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/api')) {
          await handleApiRequest(req, res);
        } else {
          next();
        }
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/api')) {
          await handleApiRequest(req, res);
        } else {
          next();
        }
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tempoBackendPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(projectDir, './src'),
    },
  },
  server: {
    port: 3000,
    open: false,
  },
});
