import * as types from "../types/index";
import SugarAuth from "./auth";
import SugarAPI from "./sugarApi";
export * from "./auth";
export * from "./sugarApi";
/**
 * Sugar Configurations:
 * Defined in src/configs/index.ts
 */
export default class Sugar {
    #private;
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
    apiRequestQueue: Array<() => Promise<void>>;
    maxQueueSize: number;
    isProcessingPaused: boolean;
    concurrentCalls: number;
    constructor(data: types.sugarConstructor);
    initialize(): Promise<void>;
    testPing(): Promise<void>;
    addToQueue(method: string, path: string, data?: any): Promise<void>;
    get(path: string): Promise<any>;
    post(path: string, data?: any): Promise<any>;
    put(path: string, data?: any): Promise<any>;
    delete(path: string): Promise<any>;
    processQueue(logMessages?: boolean): Promise<any[]>;
    setMaxQueueSize(size: number): void;
    setConcurrencyLevel(concurrency: number): void;
    getQueueSize(): number;
    getQueue(): Array<() => Promise<void>>;
    toggleQueueProcessing(): void;
    clearQueue(n?: number): void;
}
