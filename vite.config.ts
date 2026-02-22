import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  // Automatically set base path for GitHub Pages
  // GITHUB_REPOSITORY is formatted as "owner/repo"
  base: process.env.GITHUB_REPOSITORY ? `/${process.env.GITHUB_REPOSITORY.split('/')[1]}/` : '/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Video Meeting Interface',
        short_name: 'VideoMeeting',
        description: 'A countdown timer built like a video meeting',
        theme_color: '#202124',
        background_color: '#202124',
        display: 'standalone',
        icons: [] // Suppressing missing icon warnings for simplicity right now
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
