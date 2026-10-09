import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
/** Second server with lead delivery enabled against a local mock webhook (success path only). */
export const LEADS_PORT = 3101;
const MOCK_WEBHOOK_PORT = 3999;

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [
    { name: "mobile-320", use: { ...devices["Desktop Chrome"], viewport: { width: 320, height: 640 }, hasTouch: true } },
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
  ],
  webServer: [
    {
      command: `npm run start -- -p ${PORT}`,
      url: `http://localhost:${PORT}`,
      reuseExistingServer: true,
      timeout: 120_000,
    },
    {
      command: `node tests/e2e/mock-webhook.mjs`,
      url: `http://localhost:${MOCK_WEBHOOK_PORT}`,
      reuseExistingServer: true,
      env: { MOCK_WEBHOOK_PORT: String(MOCK_WEBHOOK_PORT) },
    },
    {
      command: `npm run start -- -p ${LEADS_PORT}`,
      url: `http://localhost:${LEADS_PORT}`,
      reuseExistingServer: true,
      timeout: 120_000,
      env: {
        LEAD_WEBHOOK_URL: `http://localhost:${MOCK_WEBHOOK_PORT}/leads`,
        LEAD_PRIVACY_APPROVED: "true",
      },
    },
  ],
});
