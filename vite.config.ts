import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    tailwindcss(),
  ],
  oxc: {
    // BP-03: Strip console.* and debugger from production bundle (Vite 8 uses oxc)
    transform: mode === 'production' ? {
      erase_top_level_items: ['console.log', 'console.error', 'console.warn', 'debugger'],
    } : {},
  },
}));
