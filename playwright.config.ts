import { defineConfig, devices } from 'playwright/test'

const baseURL = process.env.E2E_BASE_URL ?? 'http://127.0.0.1:5173'
const target = new URL(baseURL)

if (!['localhost', '127.0.0.1'].includes(target.hostname)) {
  throw new Error('Les tests E2E exigent une application locale isolée.')
}

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI
    ? [['list'], ['html', { open: 'never' }], ['junit', { outputFile: 'test-results/e2e-junit.xml' }]]
    : [['list'], ['html', { open: 'never' }]],
  outputDir: 'test-results/e2e',
  use: {
    baseURL,
    ...devices['Desktop Chrome'],
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
})
