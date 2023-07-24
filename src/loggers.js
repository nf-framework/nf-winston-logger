import winston from 'winston';
import { common } from '@nfjs/core';

const defaultLogger = {
    levels: 'syslog', // emerg,alert,crit,error,warning,notice,info,debug
    formats: {
        errors: {
            stack: true
        },
        timestamp: {},
        json: {}
    },
    transports: {
        default: {
            type: 'Console',
            options: {
                handleExceptions: false,
                handleRejections: false,
                level: 'info'
            }
        }
    }
};

class Loggers {
    constructor({ config }) {
        this.config = Object.assign({}, { default: defaultLogger }, config?.['@nfjs/winston-logger'] ?? {});
        this.container = new winston.Container();
        Object.keys(this.config).forEach((loggerName) => {
            const loggerCfg = this.config[loggerName];
            const loggerOptions = {
                levels: winston.config[loggerCfg?.levels ?? defaultLogger.levels].levels,
                defaultMeta: { instanceName: common.instanceName, ...(loggerCfg?.defaultMeta ?? {}) }
            };
            const formats = Object.keys(loggerCfg.formats || {}).map((f) => winston.format[f](loggerCfg.formats[f]));
            loggerOptions.format = winston.format.combine(...formats);
            loggerOptions.transports = Object.values(this.config[loggerName].transports).map((transportCfg) => {
                const transportOptions = { ...defaultLogger.transports.default.options, ...transportCfg.options };
                const formats = Object.keys(transportOptions.formats || {}).map((f) => winston.format[f](transportOptions.formats[f]));
                transportOptions.format = winston.format.combine(...formats);
                return new winston.transports[transportCfg.type || defaultLogger.transports.default.type](transportOptions);
            });
            this.container.add(loggerName, loggerOptions);

            if (loggerCfg.replaceConsoleLog) {
                const logger = this.container.get(loggerName);
                console.log = (...args) => logger.info.call(logger, ...args);
                console.info = (...args) => logger.info.call(logger, ...args);
                console.warn = (...args) => logger.warn.call(logger, ...args);
                console.error = (...args) => logger.error.call(logger, ...args);
                console.debug = (...args) => logger.debug.call(logger, ...args);
            }
        });
    }

    /**
     *
     * @param {string} name - имя логгера
     * @return {Logger}
     */
    get(name) {
        return this.container.get(name);
    }
}

export { Loggers };
