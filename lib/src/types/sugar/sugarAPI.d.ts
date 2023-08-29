import { Axios, AxiosRequestConfig } from "axios";
export interface BaseRequest {
    pathname: string;
    method: string;
}
export interface GetRequest extends BaseRequest {
    method: 'GET';
}
export interface PostRequest extends BaseRequest {
    method: 'POST';
    body?: object;
}
export type SugarCRMRequest = GetRequest | PostRequest;
export interface SugarAPIConstructor {
    client_id: string;
    client_secret: string;
    platform: string;
    access_token?: string;
    retryFailedAttempts?: number;
    delay?: number;
    sugarURL: string;
    client?: Axios;
}
export interface CustomAxiosRequestConfig extends AxiosRequestConfig {
    _retry?: boolean;
}
