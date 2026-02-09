import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    nodePolyfills({
      include: ['buffer', 'process', 'util', 'stream', 'string_decoder'],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
  ],
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@mediapipe/pose': path.resolve(__dirname, 'src/shims/mediapipe-pose.js'),
    },
  },
  assetsInclude: ['**/*.svg', '**/*.csv', '**/*.wasm', '**/*.data', '**/*.tflite', '**/*.binarypb'],
})
