"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseCommand = void 0;
const prompt_1 = require("../utils/prompt");
const logger_1 = require("../utils/logger");
const endpoints_1 = require("../api/endpoints");
const opener_1 = __importDefault(require("opener"));
const os_1 = __importDefault(require("os"));
const token_store_1 = require("../utils/token-store");
const api_client_1 = require("../api/api-client");
const config_1 = require("../api/config");
const progress_1 = require("../utils/progress");
const lodash_1 = require("lodash");
class BaseCommand {
    validateOptions(options, expected = []) {
        const missing = expected
            .filter((opt) => {
            return opt.required && !options[(0, lodash_1.camelCase)(opt.name)];
        })
            .map((opt) => `--${opt.name}`);
        if (missing.length) {
            logger_1.logger.error(`Missing required options: ${missing.join(", ")}`);
            return false;
        }
        return true;
    }
    async login() {
        try {
            // Step 1: Get user code from API
            const apiClient = new api_client_1.ApiClient(config_1.CONFIG.API.BASE_URL);
            try {
                const response = await apiClient.get(endpoints_1.ENDPOINTS.CLI_LOGIN_INITIATE);
                const { verification_uri } = response.data;
                logger_1.logger.info(`Opening your browser...${os_1.default.EOL}• Visit ${verification_uri} and enter the code:`);
                // Step 2: Open the OTA Console (UI) with the user code
                (0, opener_1.default)(verification_uri);
            }
            catch (apiError) {
                // Fallback to direct API URL if API call fails
                const fallbackUrl = `${config_1.CONFIG.API.BASE_URL}${endpoints_1.ENDPOINTS.CLI_LOGIN_INITIATE}`;
                logger_1.logger.info(`Opening your browser...${os_1.default.EOL}• Visit ${fallbackUrl} and enter the code:`);
                (0, opener_1.default)(fallbackUrl);
            }
            const token = await (0, prompt_1.promptText)("Enter your access token:");
            if (!token || token.trim().length < 5) {
                logger_1.logger.error("Invalid token entered.");
                return false;
            }
            const tokenStore = (0, token_store_1.createDefaultTokenStore)();
            await tokenStore.set("cli", {
                id: null,
                token: token.trim(),
            });
            await (0, progress_1.progress)("Verifying login", this.verifyLogin());
            logger_1.logger.success("Token saved successfully. Login successful.");
            return true;
        }
        catch (error) {
            throw new Error("Failed to login and store token");
        }
    }
    async verifyLogin() {
        try {
            const tokenStore = (0, token_store_1.createDefaultTokenStore)();
            const tokenData = await tokenStore.get("cli");
            if (!tokenData || !tokenData.accessToken?.token) {
                throw new Error();
            }
            const apiClient = new api_client_1.ApiClient(config_1.CONFIG.API.BASE_URL);
            apiClient.setToken(tokenData.accessToken.token);
            await apiClient.get(endpoints_1.ENDPOINTS.USER.VERIFY);
            return true;
        }
        catch (error) {
            throw new Error("Failed to authenticate. Invalid token.");
        }
    }
    async logout() {
        try {
            const tokenStore = (0, token_store_1.createDefaultTokenStore)();
            await tokenStore.remove("cli");
            logger_1.logger.success("Logged out successfully");
            return true;
        }
        catch (error) {
            throw new Error("Failed to logout");
        }
    }
}
exports.BaseCommand = BaseCommand;
