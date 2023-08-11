export declare class Logger {
    private logMessages;
    constructor(logMessages?: boolean);
    log(message: string): void;
    error(message: string, error?: Error): void;
    setLogging(enable: boolean): void;
}
export declare const log: Logger;
