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
        this.processQueue();
    }

    async get(path: string): Promise<any> {
        return this.sugarAPI?.get(path);
    }

    async post(path: string, data?: any): Promise<any> {
        return this.sugarAPI?.post(path, data);
    }

    async put(path: string, data?: any): Promise<any> {
        return this.sugarAPI?.put(path, data);
    }

    async delete(path: string): Promise<any> {
        return this.sugarAPI?.delete(path);
    }

    async processQueue(): Promise<any[]> {
        if (this.isProcessingPaused) return [];

        const process = async (request: () => Promise<any>, callback: (error?: Error, result?: any) => void) => {
            try {
                const result = await request();
                callback(undefined, result);  // Successful processing
            } catch (error) {
                console.error("Error processing the request:", error);
                callback(error as Error); // Error in processing
            }
        };

        return new Promise((resolve, reject) => {
            async.parallelLimit(this.apiRequestQueue.map(request => {
                return (callback: (error?: Error, result?: any) => void) => {
                    process(request, callback);
                };
            }), this.concurrentCalls, (error, results) => {
                if (error) {
                    console.error("Error in concurrent processing:", error);
                    reject(error); // Reject the promise with the error
                } else {
                    console.log("All requests processed.");
                    this.apiRequestQueue = []; // Clear the queue as all tasks have been processed or attempted.
                    resolve(results || []); // Resolve the promise with the results
                }
            });
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
        if (!this.isProcessingPaused) this.processQueue(); // if restarted, begin processing again
    }

    clearQueue(n?: number): void {
        if (n) {
            for (let i = 0; i < n; i++) {
                this.apiRequestQueue.shift();
            }
        } else {
            this.apiRequestQueue = [];
        }
    }
}
