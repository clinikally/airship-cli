import { promptText } from "@/utils/prompt";
import { logger } from "@/utils/logger";
import { ENDPOINTS } from "@/api/endpoints";
import opener from "opener";
import os from "os";
import { createDefaultTokenStore } from "@/utils/token-store";
import { ApiClient } from "@/api/api-client";
import { CONFIG } from "@/api/config";
import { progress } from "@/utils/progress";
import { CommandOption } from "@/decorators/command.decorator";
import { camelCase } from "lodash";
export abstract class BaseCommand {
  abstract execute(options: Record<string, any>): Promise<void>;

  protected validateOptions(
    options: Record<string, any>,
    expected: CommandOption[] = []
  ): boolean {
    const missing = expected
      .filter((opt) => {
        return opt.required && !options[camelCase(opt.name)];
      })
      .map((opt) => `--${opt.name}`);

    if (missing.length) {
      logger.error(`Missing required options: ${missing.join(", ")}`);
      return false;
    }

    return true;
  }

  async login(): Promise<boolean> {
    try {
      // Step 1: Get user code from API
      const apiClient = new ApiClient(CONFIG.API.BASE_URL);
      
      try {
        const response = await apiClient.get(ENDPOINTS.CLI_LOGIN_INITIATE) as any;
        const { verification_uri } = response;
        
        logger.info(
          `Opening your browser...${os.EOL}• Visit ${verification_uri} and enter the code:`
        );

        // Step 2: Open the OTA Console (UI) with the user code
        opener(verification_uri);
      } catch (apiError) {
        // Fallback to direct API URL if API call fails
        const fallbackUrl = `${CONFIG.API.BASE_URL}${ENDPOINTS.CLI_LOGIN_INITIATE}`;
        logger.info(
          `Opening your browser...${os.EOL}• Visit ${fallbackUrl} and enter the code:`
        );
        opener(fallbackUrl);
      }

      const token = await promptText("Enter your access token:");

      if (!token || token.trim().length < 5) {
        logger.error("Invalid token entered.");
        return false;
      }

      const tokenStore = createDefaultTokenStore();

      await tokenStore.set("cli", {
        id: null,
        token: token.trim(),
      });
      await progress("Verifying login", this.verifyLogin());

      logger.success("Token saved successfully. Login successful.");
      return true;
    } catch (error) {
      throw new Error("Failed to login and store token");
    }
  }

  async verifyLogin(): Promise<boolean> {
    try {
      const tokenStore = createDefaultTokenStore();
      const tokenData = await tokenStore.get("cli");
      if (!tokenData || !tokenData.accessToken?.token) {
        throw new Error();
      }
      const apiClient = new ApiClient(CONFIG.API.BASE_URL);
      apiClient.setToken(tokenData.accessToken.token);
      await apiClient.get(ENDPOINTS.USER.VERIFY);
      return true;
    } catch (error: any) {
      throw new Error("Failed to authenticate. Invalid token.");
    }
  }

  async logout(): Promise<boolean> {
    try {
      const tokenStore = createDefaultTokenStore();
      await tokenStore.remove("cli");
      logger.success("Logged out successfully");
      return true;
    } catch (error) {
      throw new Error("Failed to logout");
    }
  }
}
