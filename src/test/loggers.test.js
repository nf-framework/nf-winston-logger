import * as testing from '../loggers.js';
import assert from "assert";
describe('@nfjs/winston-logger/src/loggers', () => {
    const loggers = new testing.Loggers({
        config: {
            '@nfjs/winston-logger': {
                default: {
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
                }
            }
        }
    });
    const logger = loggers.get('default');
    const tr = logger.transports.filter(tr => tr.name === 'console')[0];
    describe('Loggers', () => {
        it('simple', async () => {
            // Arrange
            let result, res, rej;
            const wait = new Promise((resolve, reject) => { res = resolve; rej = reject});
            setTimeout(() => {rej()},2000);
            tr.on('logged', (info) => {
                result = info;
                res();
            });
            // Act
            logger.info('some');
            // Assert
            await wait;
            assert.strictEqual(result.message, 'some');
        });
        it('error', async () => {
            // Arrange
            let result, res, rej;
            const wait = new Promise((resolve, reject) => { res = resolve; rej = reject});
            setTimeout(() => {rej()},2000);
            tr.on('logged', (info) => {
                result = info;
                res();
            });
            // Act
            logger.log('error', new Error('some error'));
            // Assert
            await wait;
            assert.strictEqual(result.message, 'some error');
        });
    });
});