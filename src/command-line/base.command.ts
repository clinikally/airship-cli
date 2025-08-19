// Device flow login - no manual prompt needed
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
      
      let userCode: string;
      let verificationUri: string;
      let interval: number;

      try {
        const response = await apiClient.get(ENDPOINTS.CLI_LOGIN_INITIATE) as any;
        ({ user_code: userCode, verification_uri: verificationUri, interval } = response);
        
        logger.info(
          `Opening your browser...${os.EOL}• Visit ${verificationUri} and complete authentication in your browser.${os.EOL}• Waiting for authentication...`
        );

        // Step 2: Open the OTA Console (UI) with the user code
        opener(verificationUri);
      } catch (apiError) {
        // Fallback to direct API URL if API call fails
        const fallbackUrl = `${CONFIG.API.BASE_URL}${ENDPOINTS.CLI_LOGIN_INITIATE}`;
        logger.info(
          `Opening your browser...${os.EOL}• Visit ${fallbackUrl} and complete authentication in your browser.${os.EOL}• Waiting for authentication...`
        );
        opener(fallbackUrl);
        return false; // Can't proceed without user code
      }

      // Step 3: Poll for access token
      const accessToken = await this.pollForToken(apiClient, userCode, interval || 5);
      
      if (!accessToken) {
        logger.error("Authentication timed out or failed.");
        return false;
      }

      const tokenStore = createDefaultTokenStore();

      await tokenStore.set("cli", {
        id: null,
        token: accessToken,
      });

      await progress("Verifying login", this.verifyLogin());

      logger.success("Authentication successful! You are now logged in.");
      return true;
    } catch (error) {
      throw new Error("Failed to login and store token");
    }
  }

  private async pollForToken(apiClient: ApiClient, userCode: string, interval: number): Promise<string | null> {
    const maxAttempts = 60; // 5 minutes with 5-second intervals
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const response = await apiClient.post(`${ENDPOINTS.CLI_GET_TOKEN}?user_code=${userCode}`) as any;
        if (response.access_token) {
          return response.access_token;
        }
      } catch (error: any) {
        // User hasn't completed authentication yet, continue polling
        // Only log if it's not the expected "Not authenticated yet" error
        if (error.message && !error.message.includes("Not authenticated yet")) {
          console.log(`Polling error: ${error.message}`);
        }
      }

      await new Promise(resolve => setTimeout(resolve, interval * 1000));
      attempts++;
    }

    return null; // Timeout
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
