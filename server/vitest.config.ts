import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // The integration tests share one test database, so files run one after the other.
    fileParallelism: false,
  },
})
