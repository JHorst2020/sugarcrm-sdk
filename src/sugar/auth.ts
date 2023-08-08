import axios from "axios";
import * as types from "../types"
import configs from "../configs";

export default class SugarAuth {
    username?: string
    password?: string
    client_id?: string
    client_secret?: string
    platform?: string
    sugarURL?: string
    access_token?: string
    refresh_token?: string
    access_token_expiration?: number
    refresh_token_expiration?: number

    defaultPlatform = "base"

    constructor(data:types.sugarAuthConstructor){
        this.username = data.username 
        this.password = data.password 
        this.client_id = data.client_id 
        this.client_secret = data.client_secret 
        this.platform = data.platform 
        this.sugarURL = data.sugarURL
        this.access_token = data.access_token
        this.access_token_expiration = data.access_token_expiration
        this.refresh_token = data.refresh_token
        this.refresh_token_expiration = data.access_token_expiration
    }

    /**
     * ```undefined (default)``` - Attempts to pull a new token from Sugar using a refresh token.
     *  If that fails, it attempts to use the username/password
     * 
     * ```password``` - Attempts to pull a new token using the password method only.
     * 
     * ```refresh``` - Attempts to pull a new token using the refresh token method only.
     */
    async getToken(method: "password" | "refresh" | undefined): Promise <string>{
        try{
            if(method === undefined){
                await this.defaultMethod()
            } 
            else if(method === "password"){
                await this.#passwordMethod()
            } 
            else if(method === "refresh"){
                await this.#refreshTokenMethod()
            }
            
            return this.access_token as string
        }catch(error){
            throw error
        }
    }

    /**
     * Step 1: Attempt using the refresh token first
     * 
     * Step 2: Attempt using the password if refresh token fails
     * 
     * Step 3: Either return an access token, or throw an error
     */
    async defaultMethod():Promise <string>{
        // Refresh Token Method
        try{
            await this.#refreshTokenMethod()
        }catch(error){
            console.log(error)
        }

        // Password Method
        try{
            await this.#passwordMethod()
        }catch(error){
            console.log(error)
        }
        return this.access_token as string
    }

    /**
     * Obtains new tokens from Sugar by using the Refresh token
     */
    async #refreshTokenMethod():Promise <string | null>{
        if(!this.refresh_token){
            return null
        }
        if(!this.hasRequiredProps(this)){
            throw new Error('SugarAuth Class: Required props missing!')
        }
        try{
            this.#sugarTokenWithRefreshToken()
        }catch(e){
            console.log("#refreshTokenMethod error", e)
            throw e
        }
        try{
            await this.retrieveNewSugarTokens({
                grant_type:"refresh_token",
                client_id: this.client_id,
                client_secret: this.client_secret,
                refresh_token: this.refresh_token,
                platform: this.platform ?? this.defaultPlatform
            })
            return this.access_token as string
        }catch(e){
            if (e instanceof Error) {
                throw new Error(e.message);
            } else {
                throw new Error("An unknown error occurred in refreshTokenMethod.");
            }
        }
    }

    async #passwordMethod():Promise <string>{
        if(!this.hasRequiredProps(this)){
            throw new Error('SugarAuth Class: Required props missing!')
        }
        try{
            await this.#sugarTokenWithPassword()
            await this.retrieveNewSugarTokens({
                grant_type:"password",
                client_id: this.client_id,
                client_secret: this.client_secret,
                username: this.username,
                password: this.password,
                platform: this.platform ?? this.defaultPlatform
            })
            return this.access_token as string
        }catch(e){
            if (e instanceof Error) {
                throw new Error(e.message);
            } else {
                throw new Error("An unknown error occurred in refreshTokenMethod.");
            }
        }
    }

    /**
     * Verifies that both ```client_id``` and ```client_secret``` exist
     */
    hasRequiredProps(obj: any):obj is {client_id: string, client_secret:string}{
        return obj.client_id !== undefined && obj.client_secret !== undefined
    }

    #sugarTokenWithPassword():void{
        try{
            this.#authPreCheck("password")
        }catch(error){
            throw new Error(`Error (#sugarTokenWithPassword)`)
        }
    }

    #sugarTokenWithRefreshToken():void{
        try{
            this.#authPreCheck("refresh")
        }catch(error){
            throw new Error(`Error (#sugarTokenWithRefreshToken)`)
        }
    }

    /**
     * Checks to see if basic criteria is met before attempting to retrieve a new token from Sugar.
     * 
     * ```type = "password"```
     * 
     * - Username and Password must exist.
     * 
     * 
     * ```type = "refresh"```
     * 
     * - Refresh token must exist.
     * 
     * - Refresh token cannot be expired.
     */
    #authPreCheck(type: "password" | "refresh"): void {

        if(type === "password"){
            // Check if username and password exists
            if(!this.username || !this.password){
                throw new Error("Username or Password is missing")
            }
        }

        if(type === "refresh"){

            // Check if refresh token exists
            if(!this.refresh_token || !this.refresh_token_expiration){
                throw new Error("Refresh token is missing")
            }

            // Check if refresh token is expired
            const buffer = configs.sugar_configs.tokenExpirationBufferSeconds * 1000
            if( (Date.now() + buffer ) > this.refresh_token_expiration){
                throw new Error("Refresh token expired or is within expiration window")
            }

        }
    }

    /**
     * Makes a ```POST``` to ```<this.sugarURL>/oauth2/token``` to retrieve new tokens
     */
    async retrieveNewSugarTokens(body:types.GrantType): Promise<types.TokenInformation>{
        try{
            const issuedAt = Date.now()
            const res = await axios.post(
                `${this.sugarURL}/oauth2/token`,
                body,
                {headers:{"Content-Type":"application/json"}}
            )
            const tokenInfo = res.data
            this.access_token = tokenInfo.access_token
            return({
                issuedAt: issuedAt,
                refresh_token: tokenInfo.refresh_token,
                refresh_token_expires_in_seconds: tokenInfo.refresh_expires_in,
                access_token: tokenInfo.access_token,
                access_token_expires_in_seconds: tokenInfo.access_expires_in,
            })
        }catch(error){
            console.log("ERROR")
            throw error
        }
    }

    /**
     * Parses token information returned by Sugar, and sets values within the class
     */
    updateTokenInformation(tokenInfo:types.TokenInformation): void{
        const issuedAt = tokenInfo.issuedAt
        const access_token_expiration = issuedAt + (tokenInfo.access_token_expires_in_seconds * 1000)
        const refresh_token_expiration = issuedAt + (tokenInfo.refresh_token_expires_in_seconds * 1000)

        this.access_token = tokenInfo.access_token
        this.access_token_expiration = access_token_expiration
        this.refresh_token = tokenInfo.refresh_token
        this.refresh_token_expiration = refresh_token_expiration
    }


}