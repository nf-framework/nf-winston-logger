import { Loggers } from './index.js';
import { config, container } from '@nfjs/core';

async function init() {
    const loggers = new Loggers({ config });
    container.service('loggers', () => loggers);
    container.service('logger', () => loggers.get('default'));
}

export {
    init
};
