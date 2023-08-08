import axios, {AxiosRequestConfig} from "axios"
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
    
    
    constructor(data: types.SugarAPIConstructor){
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

    async initialize(sugarAuth: SugarAuth){
        this.sugarAuth = sugarAuth
        if(!sugarAuth) throw new Error("SugarAuth is missing")

        // Create axios client
        this.client = axios.create({
            baseURL: this.sugarURL
        })

        // Add interceptor to use most recent access token
        this.client.interceptors.request.use(async(config: AxiosRequestConfig)=>{
            config.headers = config.headers || {}
            try{
                const token = await this.sugarAuth!.getToken(undefined)
                config.headers["Authorization"] = `Bearer ${token}`
            }catch(error){
                console.error(`Error fetching the token`)
            }
            return config
        })

        // Configure axios retry
        axiosRetry(this.client, {
            retries: this.retryFailedAttempts,
            retryDelay: (retryCount)=>{
                return this.delay * retryCount
            },
            retryCondition: (error) => {
                return !!error.response && error.response.status > 300
            }
        })

    }

    async get(path:string){
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