interface Configs {
    sugar_configs:{
        username: string,
        password: string,
        client_id: string,
        client_secret: string,
        platform: string,
        host: string,
        version: string,
        tokenExpirationBufferSeconds: number
    }
}

const configs: Configs = {
    sugar_configs:{
        username: process.env.SUGAR_USERNAME ?? '',
        password: process.env.SUGAR_PASSWORD ?? '',
        client_id: process.env.SUGAR_CLIENT_ID ?? '',
        client_secret: process.env.SUGAR_CLIENT_SECRET ?? '',
        platform: process.env.SUGAR_PLATFORM ?? '',
        host: process.env.SUGAR_HOST ?? '',
        version: process.env.SUGAR_VERSION ?? '',
        tokenExpirationBufferSeconds: 60
    }
}

export default configs