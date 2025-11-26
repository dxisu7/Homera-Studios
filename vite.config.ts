import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    base: '/', // Ensures assets load correctly on Vercel
    build: {
      outDir: 'dist',
    },
    define: {
      // Polyfill process.env for the @google/genai SDK usage
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      'process.env': JSON.stringify(process.env)
    }
  };
});