import { resolve } from 'path';
import fs from 'fs';
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

export default defineConfig({
  plugins: [cleanUrlsPlugin()],
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
