import { BaseCommand } from "@command-line/base.command";
import { Command } from "@decorators/command.decorator";
import { logger } from "@utils/logger";
import { createDefaultConfigStore } from "@utils/config-store";
import { CONFIG } from "@api/config";
import inquirer from "inquirer";

@Command({
  name: "config",
  description: "Configure Airship CLI settings (API and UI URLs)",
  alias: "cfg",
})
export class ConfigCommand extends BaseCommand {
  async execute(): Promise<void> {
    const configStore = createDefaultConfigStore();
    const currentConfig = await configStore.get();

    // Get the current effective URLs (from config store or defaults)
    const currentApiUrl = currentConfig.apiBaseUrl || CONFIG.API.BASE_URL.replace('/api/v1', '');
    const currentUiUrl = currentConfig.uiBaseUrl || CONFIG.UI.BASE_URL;

    logger.title("\nAirship CLI Configuration");
    logger.subtitle("========================\n");

    logger.info(`Current API Base URL: ${currentApiUrl}`);
    logger.info(`Current UI Base URL:  ${currentUiUrl}\n`);

    const { action } = await inquirer.prompt([
      {
        type: "list",
        name: "action",
        message: "What would you like to do?",
        choices: [
          { name: "Set custom API Base URL", value: "api" },
          { name: "Set custom UI Base URL", value: "ui" },
          { name: "Set both URLs", value: "both" },
          { name: "Reset to defaults", value: "reset" },
          { name: "Exit", value: "exit" },
        ],
      },
    ]);

    if (action === "exit") {
      logger.info("Configuration unchanged.");
      return;
    }

    if (action === "reset") {
      await configStore.reset();
      logger.success("\nConfiguration reset to defaults:");
      logger.info(`API Base URL: ${CONFIG.API.BASE_URL.replace('/api/v1', '')}`);
      logger.info(`UI Base URL:  ${CONFIG.UI.BASE_URL}`);
      return;
    }

    let newApiUrl = currentApiUrl;
    let newUiUrl = currentUiUrl;

    if (action === "api" || action === "both") {
      const { apiUrl } = await inquirer.prompt([
        {
          type: "input",
          name: "apiUrl",
          message: "Enter the API Base URL (without /api/v1):",
          default: currentApiUrl,
          validate: (input: string) => {
            if (!input.trim()) {
              return "API Base URL cannot be empty";
            }
            if (input.includes("/api/v1")) {
              return "Please enter the base URL without /api/v1";
            }
            try {
              new URL(input);
              return true;
            } catch {
              return "Please enter a valid URL";
            }
          },
        },
      ]);
      newApiUrl = apiUrl.trim();
    }

    if (action === "ui" || action === "both") {
      const { uiUrl } = await inquirer.prompt([
        {
          type: "input",
          name: "uiUrl",
          message: "Enter the UI Base URL:",
          default: currentUiUrl,
          validate: (input: string) => {
            if (!input.trim()) {
              return "UI Base URL cannot be empty";
            }
            try {
              new URL(input);
              return true;
            } catch {
              return "Please enter a valid URL";
            }
          },
        },
      ]);
      newUiUrl = uiUrl.trim();
    }

    // Save configuration
    await configStore.set({
      apiBaseUrl: newApiUrl,
      uiBaseUrl: newUiUrl,
    });

    logger.success("\nConfiguration updated successfully:");
    logger.info(`API Base URL: ${newApiUrl}`);
    logger.info(`UI Base URL:  ${newUiUrl}`);
    logger.info("\nNote: Restart the CLI for changes to take effect.");
  }
}
