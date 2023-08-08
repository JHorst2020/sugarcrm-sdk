import configs from "../configs"
import * as types from "../types/index"
import SugarAuth from "./auth"
import SugarAPI from "./sugarApi"
import async from 'async';

export * from "./auth"
export * from "./sugarApi"

/**
 * Sugar Configurations:
 * Defined in src/configs/index.ts
 */
export default class Sugar {
    username: string;
    password: string;
    client_id: string;
    client_secret: string;
    platform: string;
    host: string;
    version: string;
    sugarURL?: string;
    sugarAuth?: SugarAuth;
    sugarAPI?: SugarAPI;
    apiRequestQueue: Array<() => Promise<void>> = [];
    maxQueueSize: number = 1000
    isProcessingPaused: boolean = false;
    concurrentCalls: number = 1; // default to sequential processing

    constructor(data: types.sugarConstructor) {
        this.username = data.username ?? configs.sugar_configs.username;
        this.password = data.password ?? configs.sugar_configs.password;
        this.client_id = data.client_id ?? configs.sugar_configs.client_id;
        this.client_secret = data.client_secret ?? configs.sugar_configs.client_secret;
        this.platform = data.platform ?? configs.sugar_configs.platform;
        this.host = data.host ?? configs.sugar_configs.host;
        this.version = data.version ?? configs.sugar_configs.version;
    }

    async initialize() {
        this.#setSugarURL();
        await this.#initializeSugarAuth();
        await this.#initializeSugarAPI();
        await this.testPing();
    }

    #setSugarURL(): void {
        this.sugarURL = `${this.host}/rest/${this.version}`;
    }

    async #initializeSugarAuth() {
        const configs = {
            username: this.username,
            password: this.password,
            client_id: this.client_id,
            client_secret: this.client_secret,
            platform: this.platform,
            sugarURL: this.sugarURL,
        };
        this.sugarAuth = new SugarAuth(configs);
    }

    async #initializeSugarAPI() {
        const configs = {
            client_id: this.client_id,
            client_secret: this.client_secret,
            platform: this.platform,
            sugarURL: this.sugarURL as string,
        };
        this.sugarAPI = new SugarAPI(configs);
        if (!this.sugarAuth) throw new Error("SugarAuth is missing!");
        this.sugarAPI.initialize(this.sugarAuth);
    }

    async testPing() {
        const ping = await this.sugarAPI?.get("/ping");
        console.log("Ping", ping);
    }

    async addToQueue(method: string, path: string, data?: any) {
        if (this.apiRequestQueue.length >= this.maxQueueSize) {
            throw new Error("API request queue is full. Consider processing or expanding the queue size.");
        }
        const request = async () => {
            switch (method.toUpperCase()) {
                case "GET":
                    await this.sugarAPI?.get(path);
                    break;
                case "POST":
                    await this.sugarAPI?.post(path, data);
                    break;
                case "PUT":
                    await this.sugarAPI?.put(path, data);
                    break;
                case "DELETE":
                    await this.sugarAPI?.delete(path);
                    break;
                default:
                    throw new Error("Invalid method");
            }
        };
        this.apiRequestQueue.push(request);
        this.processQueue();
    }

    async processQueue() {
        if(this.isProcessingPaused) return;

        const process = async (request: () => Promise<void>, callback: (error?: Error) => void) => {
            try {
                await request();
                callback();  // Successful processing
            } catch (error) {
                console.error("Error processing the request:", error);
                // If you'd like to retry, you can push the request back into the queue
                // this.apiRequestQueue.push(request);
                callback(error as Error); // Error in processing
            }
        };

        async.parallelLimit(this.apiRequestQueue.map(request => {
            return (callback: (error?: Error) => void) => {
                process(request, callback);
            };
        }), this.concurrentCalls, (error) => {
            if (error) {
                console.error("Error in concurrent processing:", error);
            } else {
                console.log("All requests processed.");
            }
            // Clear the queue as all tasks have been processed or attempted.
            this.apiRequestQueue = [];
        });
    }

    setMaxQueueSize(size: number): void {
        this.maxQueueSize = size;
    }

    setConcurrencyLevel(concurrency: number): void {
        this.concurrentCalls = concurrency;
    }

    getQueueSize(): number {
        return this.apiRequestQueue.length;
    }

    getQueue(): Array<() => Promise<void>> {
        return this.apiRequestQueue;
    }

    toggleQueueProcessing(): void {
        this.isProcessingPaused = !this.isProcessingPaused;
        if(!this.isProcessingPaused) this.processQueue(); // if restarted, begin processing again
    }

    clearQueue(n?: number): void {
        if (n) {
            for(let i = 0; i < n; i++) {
                this.apiRequestQueue.shift();
            }
        } else {
            this.apiRequestQueue = [];
        }
    }
}
