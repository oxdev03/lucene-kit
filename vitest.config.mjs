import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      exclude: ['scripts/**', 'src/benchmark/**', 'src/xlucene/lucene.ts', 'commitlint.config.js'],
    },
  },
});
