export interface sugarAuthConstructor {
    username?: string;
    password?: string;
    client_id: string;
    client_secret: string;
    platform: string;
    sugarURL?: string;
    access_token?: string;
    refresh_token?: string;
    access_token_expiration?: number;
    refresh_token_expiration?: number;
}
export interface RefreshGrantType {
    grant_type: "refresh_token";
    client_id: string;
    client_secret: string;
    refresh_token?: string;
    platform: string;
}
export interface PasswordGrantType {
    grant_type: "password";
    client_id: string;
    client_secret: string;
    username?: string;
    password?: string;
    platform: string;
}
export type GrantType = RefreshGrantType | PasswordGrantType;
export interface TokenInformation {
    issuedAt: number;
    refresh_token: string;
    refresh_token_expires_in_seconds: number;
    access_token: string;
    access_token_expires_in_seconds: number;
}
