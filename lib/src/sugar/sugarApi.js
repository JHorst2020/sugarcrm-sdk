"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const axios_retry_1 = __importDefault(require("axios-retry"));
class SugarAPI {
    constructor(data) {
        this.client_id = data.client_id;
        this.client_secret = data.client_secret;
        this.platform = data.platform ?? "base";
        this.access_token = data.access_token;
        this.retryFailedAttempts = data.retryFailedAttempts ?? 3;
        this.delay = data.delay ?? 0;
        this.sugarURL = data.sugarURL;
        this.client;
        this.sugarAuth;
    }
    async initialize(sugarAuth) {
        this.sugarAuth = sugarAuth;
        if (!sugarAuth)
            throw new Error("SugarAuth is missing");
        // Create axios client
        this.createClient();
        // Configure axios retry
        this.configureRetry();
        // Add interceptor to use most recent access token
        this.setInterceptors();
    }
    setInterceptors() {
        this.client.interceptors.request.use(async (config) => {
            config.headers = config.headers || {};
            try {
                const token = this.sugarAuth.access_token ?? this.sugarAuth.getToken(undefined);
                config.headers["Authorization"] = `Bearer ${token}`;
            }
            catch (error) {
                console.error(`Error fetching the token`);
            }
            return config;
        });
    }
    configureRetry() {
        (0, axios_retry_1.default)(this.client, {
            retries: this.retryFailedAttempts,
            retryDelay: (retryCount) => {
                return this.delay * retryCount;
            },
            retryCondition: (error) => {
                return !!error.response && error.response.status > 300;
            }
        });
    }
    createClient() {
        this.client = axios_1.default.create({
            baseURL: this.sugarURL
        });
    }
    async get(path) {
        const results = await this.client.get(path);
        return results.data;
    }
    async post(path, data) {
        const response = await this.client.post(path, data);
        return response.data;
    }
    async put(path, data) {
        const response = await this.client.put(path, data);
        return response.data;
    }
    async delete(path) {
        const response = await this.client.delete(path);
        return response.data;
    }
}
exports.default = SugarAPI;
//# sourceMappingURL=sugarApi.js.map