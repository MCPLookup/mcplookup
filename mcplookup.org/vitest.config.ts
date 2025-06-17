import { defineConfig } from 'vitest/config'
import path from 'path'
import tsconfigPaths from 'vite-tsconfig-paths'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    {
      name: 'auth-resolver',
      resolveId(id) {
        if (id === '@/auth') {
          return path.resolve(__dirname, './src/test/mocks/auth.ts')
        }
      }
    }
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/auth': path.resolve(__dirname, './src/test/mocks/auth.ts')
    }
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'src/**/*.spec.ts', 'src/**/*.spec.tsx'],
    exclude: ['node_modules', 'dist', '.next'],
    testTimeout: 10000, // 10 seconds for slow tests
    typecheck: {
      include: ['src/**/*.test.ts', 'src/**/*.test.tsx']
    }
  }
})
