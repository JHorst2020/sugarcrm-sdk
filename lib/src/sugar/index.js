"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _Sugar_instances, _Sugar_setSugarURL, _Sugar_initializeSugarAuth, _Sugar_initializeSugarAPI;
Object.defineProperty(exports, "__esModule", { value: true });
const configs_1 = __importDefault(require("../configs"));
const auth_1 = __importDefault(require("./auth"));
const sugarApi_1 = __importDefault(require("./sugarApi"));
const async_1 = __importDefault(require("async"));
const logger_1 = require("../logger");
__exportStar(require("./auth"), exports);
__exportStar(require("./sugarApi"), exports);
/**
 * Sugar Configurations:
 * Defined in src/configs/index.ts
 */
class Sugar {
    constructor(data) {
        _Sugar_instances.add(this);
        this.apiRequestQueue = [];
        this.maxQueueSize = 10000;
        this.isProcessingPaused = false;
        this.concurrentCalls = 1; // default to sequential processing
        this.username = data.username ?? configs_1.default.sugar_configs.username;
        this.password = data.password ?? configs_1.default.sugar_configs.password;
        this.client_id = data.client_id ?? configs_1.default.sugar_configs.client_id;
        this.client_secret = data.client_secret ?? configs_1.default.sugar_configs.client_secret;
        this.platform = data.platform ?? configs_1.default.sugar_configs.platform;
        this.host = data.host ?? configs_1.default.sugar_configs.host;
        this.version = data.version ?? configs_1.default.sugar_configs.version;
    }
    async initialize() {
        __classPrivateFieldGet(this, _Sugar_instances, "m", _Sugar_setSugarURL).call(this);
        await __classPrivateFieldGet(this, _Sugar_instances, "m", _Sugar_initializeSugarAuth).call(this);
        await __classPrivateFieldGet(this, _Sugar_instances, "m", _Sugar_initializeSugarAPI).call(this);
        await this.testPing();
    }
    async testPing() {
        const ping = await this.sugarAPI?.get("/ping");
        console.log(`sugarcrm-sdk: ${ping === "pong" ? "ready" : "connection failed"}`);
    }
    async addToQueue(method, path, data) {
        if (this.apiRequestQueue.length >= this.maxQueueSize) {
            throw new Error("API request queue is full. Consider processing or expanding the queue size.");
        }
        let request;
        switch (method.toUpperCase()) {
            case "GET":
                request = async () => await this.get(path);
                break;
            case "POST":
                request = async () => await this.post(path, data);
                break;
            case "PUT":
                request = async () => await this.put(path, data);
                break;
            case "DELETE":
                request = async () => await this.delete(path);
                break;
            default:
                throw new Error("Invalid method");
        }
        this.apiRequestQueue.push(request);
    }
    async get(path) {
        return this.sugarAPI?.get(path);
    }
    async post(path, data) {
        return this.sugarAPI?.post(path, data);
    }
    async put(path, data) {
        return this.sugarAPI?.put(path, data);
    }
    async delete(path) {
        return this.sugarAPI?.delete(path);
    }
    async processQueue() {
        if (this.isProcessingPaused)
            return [];
        const process = async (request, callback, requestId) => {
            logger_1.log.log(`Processing request ${requestId}...`);
            const startTime = Date.now();
            try {
                const result = await request();
                const endTime = Date.now();
                const timeTaken = endTime - startTime;
                logger_1.log.log(`Request ${requestId} processed successfully. Time taken: ${timeTaken} ms`);
                callback(undefined, result);
            }
            catch (error) {
                logger_1.log.error(`Error processing request ${requestId}:`, error);
                callback(error);
            }
        };
        return new Promise((resolve, reject) => {
            async_1.default.parallelLimit(this.apiRequestQueue.map((request, index) => {
                return (callback) => {
                    process(request, callback, index);
                };
            }), this.concurrentCalls, (error, results) => {
                if (error) {
                    logger_1.log.error("Error in concurrent processing:", error);
                    reject(error);
                }
                else {
                    logger_1.log.log("All requests processed.");
                    this.apiRequestQueue = [];
                    resolve(results || []);
                }
            });
        });
    }
    setMaxQueueSize(size) {
        this.maxQueueSize = size;
    }
    setConcurrencyLevel(concurrency) {
        this.concurrentCalls = concurrency;
    }
    getQueueSize() {
        return this.apiRequestQueue.length;
    }
    getQueue() {
        return this.apiRequestQueue;
    }
    toggleQueueProcessing() {
        this.isProcessingPaused = !this.isProcessingPaused;
        if (!this.isProcessingPaused)
            this.processQueue(); // if restarted, begin processing again
    }
    clearQueue(n) {
        if (n) {
            for (let i = 0; i < n; i++) {
                this.apiRequestQueue.shift();
            }
        }
        else {
            this.apiRequestQueue = [];
        }
    }
    logEvents(enable = false) {
        logger_1.log.setLogging(enable);
    }
}
exports.default = Sugar;
_Sugar_instances = new WeakSet(), _Sugar_setSugarURL = function _Sugar_setSugarURL() {
    this.sugarURL = `${this.host}/rest/${this.version}`;
}, _Sugar_initializeSugarAuth = async function _Sugar_initializeSugarAuth() {
    const configs = {
        username: this.username,
        password: this.password,
        client_id: this.client_id,
        client_secret: this.client_secret,
        platform: this.platform,
        sugarURL: this.sugarURL,
    };
    this.sugarAuth = new auth_1.default(configs);
}, _Sugar_initializeSugarAPI = async function _Sugar_initializeSugarAPI() {
    const configs = {
        client_id: this.client_id,
        client_secret: this.client_secret,
        platform: this.platform,
        sugarURL: this.sugarURL,
    };
    this.sugarAPI = new sugarApi_1.default(configs);
    if (!this.sugarAuth)
        throw new Error("SugarAuth is missing!");
    this.sugarAPI.initialize(this.sugarAuth);
};
//# sourceMappingURL=index.js.map