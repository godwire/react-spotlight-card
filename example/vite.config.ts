import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Import the component straight from source so the demo always
      // reflects the current code, with no separate build/link step.
      'react-spotlight-card': resolve(__dirname, '../src/index.ts'),
    },
  },
  server: {
    fs: {
      allow: ['..'],
    },
  },
})
