import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, (process as any).cwd(), '');

  // Check for GEMINI_API_KEY (Vercel) or API_KEY (local .env)
  const apiKey = env.GEMINI_API_KEY || env.API_KEY;

  return {
    plugins: [react()],
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