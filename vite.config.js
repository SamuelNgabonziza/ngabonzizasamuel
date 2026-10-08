import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: [
        'index.html',
        'about.html',
        'projects.html',
        'services.html',
        'posts.html',
        'contact.html',
        'auth.html',
        'admin.html'
      ]
    }
  }
});
