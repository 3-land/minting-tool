import { fileURLToPath, URL } from 'node:url'

import { templateCompilerOptions } from '@tresjs/core'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    vue({
      ...templateCompilerOptions
    }),
  ],
  resolve: {
    alias: {
      crypto: "crypto-browserify",
      stream: "stream-browserify",
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
