import { defineConfig } from "cypress";
import { config } from "dotenv";

config();

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      return {
        ...config,
        env: {
          ...config.env,
          apiUrl: process.env.API_BASE_URL,
        },
      };
    },
  },
});
