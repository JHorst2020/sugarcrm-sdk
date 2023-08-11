"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = exports.Logger = void 0;
class Logger {
    constructor(logMessages = false) {
        this.logMessages = logMessages;
    }
    log(message) {
        if (this.logMessages) {
            console.log(message);
        }
    }
    error(message, error) {
        if (this.logMessages) {
            console.error(message, error);
        }
    }
    // Method to enable or disable logging
    setLogging(enable) {
        this.logMessages = enable;
    }
}
exports.Logger = Logger;
exports.log = new Logger();
//# sourceMappingURL=logger.js.map