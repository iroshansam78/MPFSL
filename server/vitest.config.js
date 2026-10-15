import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./tests/setup.js'],
    // Each test file gets its own in-memory MongoDB; run files one at a time to keep memory low.
    fileParallelism: false,
    hookTimeout: 180_000, // first run downloads a MongoDB binary
    testTimeout: 20_000,
    env: {
      NODE_ENV: 'test',
      SESSION_SECRET: 'test-session-secret-that-is-long-enough-1234567890',
      ADMIN_ORIGIN: 'http://admin.test',
      PUBLIC_ORIGINS: 'http://site.test',
      LOGIN_RATE_LIMIT: '1000',
      // placeholder; tests/setup.js replaces it with the in-memory database
      MONGODB_URI: 'mongodb://placeholder',
    },
  },
})
