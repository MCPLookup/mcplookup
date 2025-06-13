import { defineConfig } from 'vitest/config'
import path from 'path'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [
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
    typecheck: {
      include: ['src/**/*.test.ts', 'src/**/*.test.tsx']
    }
  }
})
