export interface sugarConstructor {
    username: string,
    password: string,
    client_id: string,
    client_secret: string,
    platform: string,
    host: string,
    version: string, 
}

export interface sugarRequest {
    pathname: string,
    method: string,
    body?: object,
    data?: object
}