"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiClient = void 0;
const axios_1 = __importDefault(require("axios"));
class ApiClient {
    constructor(baseURL) {
        this.baseURL = baseURL;
        this.client = axios_1.default.create({
            baseURL,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }
    // GET request
    async get(url, config) {
        try {
            const response = await this.client.get(url, config);
            return response.data;
        }
        catch (error) {
            throw this.handleError(error);
        }
    }
    // POST request
    async post(url, data, config) {
        try {
            const response = await this.client.post(url, data, config);
            return response.data;
        }
        catch (error) {
            throw this.handleError(error);
        }
    }
    // PUT request
    async put(url, data, config) {
        try {
            const response = await this.client.put(url, data, config);
            return response.data;
        }
        catch (error) {
            throw this.handleError(error);
        }
    }
    // DELETE request
    async delete(url, config) {
        try {
            const response = await this.client.delete(url, config);
            return response.data;
        }
        catch (error) {
            throw this.handleError(error);
        }
    }
    // PATCH request
    async patch(url, data, config) {
        try {
            const response = await this.client.patch(url, data, config);
            return response.data;
        }
        catch (error) {
            throw this.handleError(error);
        }
    }
    handleError(error) {
        if (axios_1.default.isAxiosError(error)) {
            const axiosError = error;
            if (axiosError.response) {
                return new Error(error?.response?.data?.errors?.data?.[0]?.message ||
                    `API Error: ${axiosError.response.status} - ${JSON.stringify(axiosError.response.data)}`);
            }
            return new Error(`API Error: ${axiosError.message}`);
        }
        return error;
    }
    // Update base URL
    setBaseURL(baseURL) {
        this.baseURL = baseURL;
        this.client.defaults.baseURL = baseURL;
    }
    // Update default headers
    setHeaders(headers) {
        this.client.defaults.headers = {
            ...this.client.defaults.headers,
            ...headers,
        };
    }
    setToken(token) {
        this.client.defaults.headers["x-access-token"] = token;
    }
    // Get current base URL
    getBaseURL() {
        return this.baseURL;
    }
}
exports.ApiClient = ApiClient;
