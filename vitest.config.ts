import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

export default defineConfig({
  plugins: [react()],
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/webview/__tests__/setup.ts'],
    include: ['src/webview/__tests__/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/webview/**/*.{ts,tsx}', 'src/automation/**/*.ts'],
      exclude: ['src/webview/__tests__/**', 'src/webview/main.tsx'],
    },
  },
});
