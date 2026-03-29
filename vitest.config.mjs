import { defineConfig } from 'vitest/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    environmentOptions: {
      jsdom: {
        url: 'http://localhost/',
      },
    },
    include: [
      'tests/**/*.test.ts',
      'src/tests/accessibility/**/*.test.ts?(x)',
      'src/tests/unit/**/*.test.ts?(x)',
      'src/tests/utils/**/*.test.ts?(x)',
    ],
  },
});

