"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _SugarAuth_instances, _SugarAuth_refreshTokenMethod, _SugarAuth_passwordMethod, _SugarAuth_sugarTokenWithPassword, _SugarAuth_sugarTokenWithRefreshToken, _SugarAuth_authPreCheck;
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const configs_1 = __importDefault(require("../configs"));
class SugarAuth {
    constructor(data) {
        _SugarAuth_instances.add(this);
        this.defaultPlatform = "base";
        this.username = data.username;
        this.password = data.password;
        this.client_id = data.client_id;
        this.client_secret = data.client_secret;
        this.platform = data.platform;
        this.sugarURL = data.sugarURL;
        this.access_token = data.access_token;
        this.access_token_expiration = data.access_token_expiration;
        this.refresh_token = data.refresh_token;
        this.refresh_token_expiration = data.access_token_expiration;
    }
    /**
     * ```undefined (default)``` - Attempts to pull a new token from Sugar using a refresh token.
     *  If that fails, it attempts to use the username/password
     *
     * ```password``` - Attempts to pull a new token using the password method only.
     *
     * ```refresh``` - Attempts to pull a new token using the refresh token method only.
     */
    async getToken(method) {
        try {
            if (method === undefined) {
                await this.defaultMethod();
            }
            else if (method === "password") {
                await __classPrivateFieldGet(this, _SugarAuth_instances, "m", _SugarAuth_passwordMethod).call(this);
            }
            else if (method === "refresh") {
                await __classPrivateFieldGet(this, _SugarAuth_instances, "m", _SugarAuth_refreshTokenMethod).call(this);
            }
            return this.access_token;
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Step 1: Attempt using the refresh token first
     *
     * Step 2: Attempt using the password if refresh token fails
     *
     * Step 3: Either return an access token, or throw an error
     */
    async defaultMethod() {
        // Refresh Token Method
        try {
            await __classPrivateFieldGet(this, _SugarAuth_instances, "m", _SugarAuth_refreshTokenMethod).call(this);
        }
        catch (error) {
            console.log(error);
        }
        // Password Method
        try {
            await __classPrivateFieldGet(this, _SugarAuth_instances, "m", _SugarAuth_passwordMethod).call(this);
        }
        catch (error) {
            console.log(error);
        }
        return this.access_token;
    }
    /**
     * Verifies that both ```client_id``` and ```client_secret``` exist
     */
    hasRequiredProps(obj) {
        return obj.client_id !== undefined && obj.client_secret !== undefined;
    }
    /**
     * Makes a ```POST``` to ```<this.sugarURL>/oauth2/token``` to retrieve new tokens
     */
    async retrieveNewSugarTokens(body) {
        try {
            const issuedAt = Date.now();
            const res = await axios_1.default.post(`${this.sugarURL}/oauth2/token`, body, { headers: { "Content-Type": "application/json" } });
            const tokenInfo = res.data;
            this.access_token = tokenInfo.access_token;
            return ({
                issuedAt: issuedAt,
                refresh_token: tokenInfo.refresh_token,
                refresh_token_expires_in_seconds: tokenInfo.refresh_expires_in,
                access_token: tokenInfo.access_token,
                access_token_expires_in_seconds: tokenInfo.access_expires_in,
            });
        }
        catch (error) {
            console.log("ERROR");
            throw error;
        }
    }
    /**
     * Parses token information returned by Sugar, and sets values within the class
     */
    updateTokenInformation(tokenInfo) {
        const issuedAt = tokenInfo.issuedAt;
        const access_token_expiration = issuedAt + (tokenInfo.access_token_expires_in_seconds * 1000);
        const refresh_token_expiration = issuedAt + (tokenInfo.refresh_token_expires_in_seconds * 1000);
        this.access_token = tokenInfo.access_token;
        this.access_token_expiration = access_token_expiration;
        this.refresh_token = tokenInfo.refresh_token;
        this.refresh_token_expiration = refresh_token_expiration;
    }
}
_SugarAuth_instances = new WeakSet(), _SugarAuth_refreshTokenMethod = 
/**
 * Obtains new tokens from Sugar by using the Refresh token
 */
async function _SugarAuth_refreshTokenMethod() {
    if (!this.refresh_token) {
        return null;
    }
    if (!this.hasRequiredProps(this)) {
        throw new Error('SugarAuth Class: Required props missing!');
    }
    try {
        __classPrivateFieldGet(this, _SugarAuth_instances, "m", _SugarAuth_sugarTokenWithRefreshToken).call(this);
    }
    catch (e) {
        console.log("#refreshTokenMethod error", e);
        throw e;
    }
    try {
        await this.retrieveNewSugarTokens({
            grant_type: "refresh_token",
            client_id: this.client_id,
            client_secret: this.client_secret,
            refresh_token: this.refresh_token,
            platform: this.platform ?? this.defaultPlatform
        });
        return this.access_token;
    }
    catch (e) {
        if (e instanceof Error) {
            throw new Error(e.message);
        }
        else {
            throw new Error("An unknown error occurred in refreshTokenMethod.");
        }
    }
}, _SugarAuth_passwordMethod = async function _SugarAuth_passwordMethod() {
    if (!this.hasRequiredProps(this)) {
        throw new Error('SugarAuth Class: Required props missing!');
    }
    try {
        await __classPrivateFieldGet(this, _SugarAuth_instances, "m", _SugarAuth_sugarTokenWithPassword).call(this);
        await this.retrieveNewSugarTokens({
            grant_type: "password",
            client_id: this.client_id,
            client_secret: this.client_secret,
            username: this.username,
            password: this.password,
            platform: this.platform ?? this.defaultPlatform
        });
        return this.access_token;
    }
    catch (e) {
        if (e instanceof Error) {
            throw new Error(e.message);
        }
        else {
            throw new Error("An unknown error occurred in refreshTokenMethod.");
        }
    }
}, _SugarAuth_sugarTokenWithPassword = function _SugarAuth_sugarTokenWithPassword() {
    try {
        __classPrivateFieldGet(this, _SugarAuth_instances, "m", _SugarAuth_authPreCheck).call(this, "password");
    }
    catch (error) {
        throw new Error(`Error (#sugarTokenWithPassword)`);
    }
}, _SugarAuth_sugarTokenWithRefreshToken = function _SugarAuth_sugarTokenWithRefreshToken() {
    try {
        __classPrivateFieldGet(this, _SugarAuth_instances, "m", _SugarAuth_authPreCheck).call(this, "refresh");
    }
    catch (error) {
        throw new Error(`Error (#sugarTokenWithRefreshToken)`);
    }
}, _SugarAuth_authPreCheck = function _SugarAuth_authPreCheck(type) {
    if (type === "password") {
        // Check if username and password exists
        if (!this.username || !this.password) {
            throw new Error("Username or Password is missing");
        }
    }
    if (type === "refresh") {
        // Check if refresh token exists
        if (!this.refresh_token || !this.refresh_token_expiration) {
            throw new Error("Refresh token is missing");
        }
        // Check if refresh token is expired
        const buffer = configs_1.default.sugar_configs.tokenExpirationBufferSeconds * 1000;
        if ((Date.now() + buffer) > this.refresh_token_expiration) {
            throw new Error("Refresh token expired or is within expiration window");
        }
    }
};
exports.default = SugarAuth;
//# sourceMappingURL=auth.js.map