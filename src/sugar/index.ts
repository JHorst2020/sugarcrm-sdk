import configs from "../configs"
import * as types from "../types/index"
import SugarAuth from "./auth"
import SugarAPI from "./sugarApi"
import async from 'async';
import { log } from "../logger";

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
    maxQueueSize: number = 10000
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
        console.log(`sugarcrm-sdk: ${ping === "pong" ? "ready": "connection failed"}`);
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
    
        const process = async (request: () => Promise<any>, callback: (error?: Error, result?: any) => void, requestId: number) => {
            log.log(`Processing request ${requestId}...`);
            const startTime = Date.now();
            try {
                const result = await request();
                const endTime = Date.now();
                const timeTaken = endTime - startTime;
                log.log(`Request ${requestId} processed successfully. Time taken: ${timeTaken} ms`);
                callback(undefined, result);
            } catch (error) {
                log.error(`Error processing request ${requestId}:`, error as Error);
                callback(error as Error);
            }
        };
    
        return new Promise((resolve, reject) => {
            async.parallelLimit(this.apiRequestQueue.map((request, index) => {
                return (callback: (error?: Error, result?: any) => void) => {
                    process(request, callback, index);
                };
            }), this.concurrentCalls, (error, results) => {
                if (error) {
                    log.error("Error in concurrent processing:", error);
                    reject(error);
                } else {
                    log.log("All requests processed.");
                    this.apiRequestQueue = [];
                    resolve(results || []);
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

    logEvents(enable:boolean = false){
        log.setLogging(enable)
    }
}
