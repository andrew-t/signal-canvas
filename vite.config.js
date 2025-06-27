import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      name: "signal-canvas",
      entry: ['src/index.ts'],
      fileName: (format, entryName) => `signal-canvas.${format}.js`,
      cssFileName: 'signal-canvas-style',
    },
  },
  plugins: [dts()]
});
