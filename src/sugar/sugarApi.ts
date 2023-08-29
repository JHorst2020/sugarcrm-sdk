import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios"
import axiosRetry from "axios-retry"
import * as types from "../types"
import SugarAuth from "./auth"


export default class SugarAPI {
    client_id: string
    client_secret: string
    platform: string
    access_token?: string
    retryFailedAttempts: number
    delay: number
    client?: any
    sugarAuth?: SugarAuth
    sugarURL: string


    constructor(data: types.SugarAPIConstructor) {
        this.client_id = data.client_id
        this.client_secret = data.client_secret
        this.platform = data.platform ?? "base"
        this.access_token = data.access_token
        this.retryFailedAttempts = data.retryFailedAttempts ?? 3
        this.delay = data.delay ?? 0
        this.sugarURL = data.sugarURL

        this.client
        this.sugarAuth
    }

    async initialize(sugarAuth: SugarAuth) {
        this.sugarAuth = sugarAuth
        if (!sugarAuth) throw new Error("SugarAuth is missing")

        // Create axios client
        this.createClient()

        // Configure axios retry
        this.configureRetry()

        // Add interceptor to use most recent access token
        this.setInterceptors()

    }

    setInterceptors() {
        // Request Interceptor
        this.client.interceptors.request.use(async (config: types.CustomAxiosRequestConfig) => {
            config.headers = config.headers || {}
            try {
                const token = this.sugarAuth!.access_token ?? this.sugarAuth!.getToken(undefined)
                config.headers["Authorization"] = `Bearer ${token}`
            } catch (error) {
                console.error(`Error fetching the token`)
            }
            return config
        })

        // Response Interceptor
        this.client.interceptors.response.use(
            (response?: AxiosResponse) => {
              return response;
            },
            async (error: AxiosError) => {
              const originalRequest = error.config as types.CustomAxiosRequestConfig;
      
              // If status is 401, try to refresh the token
              if (originalRequest && originalRequest.headers && error?.response?.status === 401 && !originalRequest?._retry) {
                originalRequest._retry = true;
      
                await this.sugarAuth!.getToken(undefined); // Refresh the token
      
                // After token refresh, retry the original request
                const token = this.sugarAuth!.getToken(undefined);
                originalRequest.headers["Authorization"] = `Bearer ${token}`;
      
                return this.client(originalRequest);
              }
      
              return Promise.reject(error);
            }
          );
    }

    configureRetry(){
        axiosRetry(this.client, {
            retries: this.retryFailedAttempts,
            retryDelay: (retryCount) => {
                return this.delay * retryCount
            },
            retryCondition: (error) => {
                return !!error.response && error.response.status > 300
            }
        })
    }

    createClient(){
        this.client = axios.create({
            baseURL: this.sugarURL
        })
    }

    async get(path: string) {
        const results = await this.client.get(path)
        return results.data
    }

    async post(path: string, data: any) {
        const response = await this.client.post(path, data);
        return response.data;
    }

    async put(path: string, data: any) {
        const response = await this.client.put(path, data);
        return response.data;
    }

    async delete(path: string) {
        const response = await this.client.delete(path);
        return response.data;
    }




}