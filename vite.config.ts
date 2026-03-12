import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, (process as any).cwd(), '');

  // Check for GEMINI_API_KEY (Vercel) or API_KEY (local .env)
  const apiKey = env.GEMINI_API_KEY || env.API_KEY;

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['icon.svg'],
        manifest: {
          name: 'SquareMaster',
          short_name: 'SquareMaster',
          description: 'High-speed mental math trainer',
          theme_color: '#4f46e5',
          background_color: '#0f172a',
          display: 'standalone',
          icons: [
            {
              src: 'icon.svg',
              sizes: '192x192',
              type: 'image/svg+xml'
            },
            {
              src: 'icon.svg',
              sizes: '512x512',
              type: 'image/svg+xml'
            }
          ]
        }
      })
    ],
    define: {
      // Polyfill process.env.API_KEY for the SDK
      // This injects the value into the client-side code at build time
      'process.env.API_KEY': JSON.stringify(apiKey)
    },
    build: {
      outDir: 'dist',
      target: 'esnext'
    },
    server: {
      port: 3000
    }
  };
});