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
}