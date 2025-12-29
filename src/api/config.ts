import { createDefaultConfigStore } from "@utils/config-store";

// Load custom config synchronously at startup
function loadConfig() {
  try {
    const configStore = createDefaultConfigStore();
    const fs = require("fs");
    const configPath = configStore.getStoreFilePath();

    let customConfig: { apiBaseUrl?: string; uiBaseUrl?: string } = {};
    try {
      const content = fs.readFileSync(configPath, "utf8");
      customConfig = JSON.parse(content);
    } catch {
      // No custom config file, use defaults
    }

    const apiBaseUrl =
      process.env.AIRSHIP_API_BASE_URL ||
      customConfig.apiBaseUrl ||
      "https://airship-api.clinikally.shop";

    const uiBaseUrl =
      process.env.AIRSHIP_UI_BASE_URL ||
      customConfig.uiBaseUrl ||
      "https://airship.clinikally.shop";

    return {
      API: {
        BASE_URL: `${apiBaseUrl}/api/v1`,
      },
      UI: {
        BASE_URL: uiBaseUrl,
      },
      BUNDLE_EXTENSION: ".airshipsigned",
    } as const;
  } catch (error) {
    // Fallback to defaults if any error occurs
    return {
      API: {
        BASE_URL: process.env.AIRSHIP_API_BASE_URL
          ? `${process.env.AIRSHIP_API_BASE_URL}/api/v1`
          : "https://airship-api.clinikally.shop/api/v1",
      },
      UI: {
        BASE_URL: process.env.AIRSHIP_UI_BASE_URL
          ? process.env.AIRSHIP_UI_BASE_URL
          : "https://airship.clinikally.shop",
      },
      BUNDLE_EXTENSION: ".airshipsigned",
    } as const;
  }
}

export const CONFIG = loadConfig();
