interface Configs {
    sugar_configs: {
        username: string;
        password: string;
        client_id: string;
        client_secret: string;
        platform: string;
        host: string;
        version: string;
        tokenExpirationBufferSeconds: number;
    };
    logs?: boolean;
}
declare const configs: Configs;
export default configs;
