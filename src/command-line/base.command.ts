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
      // Check if already logged in
      const tokenStoreCheck = createDefaultTokenStore();
      const existingToken = await tokenStoreCheck.get("cli");
      
      if (existingToken && existingToken.accessToken?.token) {
        try {
          const apiClient = new ApiClient(CONFIG.API.BASE_URL);
          apiClient.setToken(existingToken.accessToken.token);
          const response = await apiClient.post(ENDPOINTS.USER.VERIFY) as any;
          
          logger.success(`Already logged in as ${response.email || 'user'}`);
          return true;
        } catch (error) {
          // Token is invalid, proceed with new login
        }
      }

      // Step 1: Get user code from API
      const apiClient = new ApiClient(CONFIG.API.BASE_URL);
      
      let userCode: string;
      let verificationUri: string;
      let interval: number;

      try {
        const response = await apiClient.get(ENDPOINTS.CLI_LOGIN_INITIATE) as any;
        ({ user_code: userCode, verification_uri: verificationUri, interval } = response);

        // Override the verification URI host with the configured UI URL
        // This ensures users are redirected to their configured UI, not the API's default
        const apiVerificationUrl = new URL(verificationUri);
        const configuredUiUrl = new URL(CONFIG.UI.BASE_URL);
        const finalVerificationUri = `${configuredUiUrl.origin}${apiVerificationUrl.pathname}${apiVerificationUrl.search}`;

        logger.info(
          `Opening your browser...${os.EOL}• Visit ${finalVerificationUri} and complete authentication in your browser.${os.EOL}• Waiting for authentication...`
        );

        // Step 2: Open the OTA Console (UI) with the user code using configured UI URL
        opener(finalVerificationUri);
      } catch (apiError) {
        // Fallback to direct API URL if API call fails
        console.log("DEBUG: API Error during CLI login initiate:", apiError);
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
      
      const tokenData = {
        id: null,
        token: accessToken,
      };
      
      await tokenStore.set("cli", tokenData);

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
        // Only show error if it's not the expected "Not authenticated yet" error
        if (!error.message || !error.message.includes("Not authenticated yet")) {
          // Unexpected error, but continue polling
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
        throw new Error("No valid token in store");
      }
      
      const apiClient = new ApiClient(CONFIG.API.BASE_URL);
      apiClient.setToken(tokenData.accessToken.token);
      
      await apiClient.post(ENDPOINTS.USER.VERIFY);
      return true;
    } catch (error: any) {
      throw new Error("Failed to authenticate. Invalid token.");
    }
  }

  async logout(): Promise<boolean> {
    try {
      const tokenStore = createDefaultTokenStore();
      const tokenData = await tokenStore.get("cli");
      
      // If we have a token, try to revoke it on the server
      if (tokenData && tokenData.accessToken?.token) {
        try {
          const apiClient = new ApiClient(CONFIG.API.BASE_URL);
          apiClient.setToken(tokenData.accessToken.token);
          // Note: We could add a /auth/logout endpoint on the backend later
          // For now, just remove locally
        } catch (error) {
          // Could not revoke token on server, proceed with local removal
        }
      }
      
      await tokenStore.remove("cli");
      logger.success("Logged out successfully");
      return true;
    } catch (error) {
      throw new Error("Failed to logout");
    }
  }
}
