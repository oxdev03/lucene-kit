import { defineConfig } from 'vitest/config';
import codspeedPlugin from '@codspeed/vitest-plugin';

export default defineConfig({
  plugins: [codspeedPlugin()],
  test: {
    coverage: {
      exclude: ['scripts/**', 'src/benchmark/**', 'src/xlucene/lucene.ts', 'commitlint.config.js'],
    },
  },
});
