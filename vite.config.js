import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
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
