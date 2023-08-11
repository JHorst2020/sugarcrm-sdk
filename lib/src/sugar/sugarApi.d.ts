import * as types from "../types";
import SugarAuth from "./auth";
export default class SugarAPI {
    client_id: string;
    client_secret: string;
    platform: string;
    access_token?: string;
    retryFailedAttempts: number;
    delay: number;
    client?: any;
    sugarAuth?: SugarAuth;
    sugarURL: string;
    constructor(data: types.SugarAPIConstructor);
    initialize(sugarAuth: SugarAuth): Promise<void>;
    setInterceptors(): void;
    configureRetry(): void;
    createClient(): void;
    get(path: string): Promise<any>;
    post(path: string, data: any): Promise<any>;
    put(path: string, data: any): Promise<any>;
    delete(path: string): Promise<any>;
}
