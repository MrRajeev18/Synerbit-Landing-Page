import { resolve } from 'path';
import fs from 'fs';
import { exec } from 'child_process';
import { defineConfig } from 'vite';

function cleanUrlsPlugin() {
  return {
    name: 'clean-urls-generator',
    closeBundle() {
      const distDir = resolve(__dirname, 'dist');
      const pages = ['products', 'jobs', 'submit-idea', 'privacy', 'terms', 'cookies'];

      pages.forEach((page) => {
        const srcFile = resolve(distDir, `${page}.html`);
        const targetDir = resolve(distDir, page);
        const targetFile = resolve(targetDir, 'index.html');

        if (fs.existsSync(srcFile)) {
          if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
          }
          fs.copyFileSync(srcFile, targetFile);
        }
      });
    }
  };
}

function analyticsSyncPlugin() {
  return {
    name: 'analytics-sync-endpoint',
    configureServer(server) {
      server.middlewares.use('/api/sync-analytics', (req, res) => {
        if (req.method === 'POST' || req.method === 'GET') {
          const scriptPath = resolve(__dirname, 'scripts/sync-ga4.js');
          exec(`node "${scriptPath}"`, (err, stdout, stderr) => {
            if (err) {
              console.warn("[Vite GA4 Sync] Warning:", stderr || err.message);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: err.message }));
              return;
            }
            console.log("[Vite GA4 Sync] Executed successfully:", stdout.trim().split('\n').slice(-2).join(' '));
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, message: 'GA4 telemetry synchronized successfully' }));
          });
        }
      });
    }
  };
}

export default defineConfig({
  plugins: [cleanUrlsPlugin(), analyticsSyncPlugin()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        products: resolve(__dirname, 'products.html'),
        jobs: resolve(__dirname, 'jobs.html'),
        submitIdea: resolve(__dirname, 'submit-idea.html'),
        privacy: resolve(__dirname, 'privacy.html'),
        terms: resolve(__dirname, 'terms.html'),
        cookies: resolve(__dirname, 'cookies.html'),
        admin: resolve(__dirname, 'admin/index.html')
      }
    }
  }
});
