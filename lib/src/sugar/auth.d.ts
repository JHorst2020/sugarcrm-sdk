import * as types from "../types";
export default class SugarAuth {
    #private;
    username?: string;
    password?: string;
    client_id?: string;
    client_secret?: string;
    platform?: string;
    sugarURL?: string;
    access_token?: string;
    refresh_token?: string;
    access_token_expiration?: number;
    refresh_token_expiration?: number;
    defaultPlatform: string;
    constructor(data: types.sugarAuthConstructor);
    /**
     * ```undefined (default)``` - Attempts to pull a new token from Sugar using a refresh token.
     *  If that fails, it attempts to use the username/password
     *
     * ```password``` - Attempts to pull a new token using the password method only.
     *
     * ```refresh``` - Attempts to pull a new token using the refresh token method only.
     */
    getToken(method: "password" | "refresh" | undefined): Promise<string>;
    /**
     * Step 1: Attempt using the refresh token first
     *
     * Step 2: Attempt using the password if refresh token fails
     *
     * Step 3: Either return an access token, or throw an error
     */
    defaultMethod(): Promise<string>;
    /**
     * Verifies that both ```client_id``` and ```client_secret``` exist
     */
    hasRequiredProps(obj: any): obj is {
        client_id: string;
        client_secret: string;
    };
    /**
     * Makes a ```POST``` to ```<this.sugarURL>/oauth2/token``` to retrieve new tokens
     */
    retrieveNewSugarTokens(body: types.GrantType): Promise<types.TokenInformation>;
    /**
     * Parses token information returned by Sugar, and sets values within the class
     */
    updateTokenInformation(tokenInfo: types.TokenInformation): void;
}
