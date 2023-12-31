export class Logger {
    private logMessages: boolean;

    constructor(logMessages: boolean = false) {
        this.logMessages = logMessages;
    }

    log(message: string) {
        if (this.logMessages) {
            console.log(message);
        }
    }

    error(message: string, error?: Error) {
        if (this.logMessages) {
            console.error(message, error);
        }
    }

    // Method to enable or disable logging
    setLogging(enable: boolean) {
        this.logMessages = enable;
    }
}

export const log = new Logger()