import { defineConfig } from 'cypress'

export default defineConfig({
  viewportWidth: 1280,
  viewportHeight: 720,
  screenshotOnRunFailure: false,
  video: false,
  e2e: {
    baseUrl: 'http://127.0.0.1:8000',
  },
})
