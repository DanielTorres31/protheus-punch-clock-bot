import { configure, getLogger as _getLogger, Configuration } from 'log4js'

const LOGGER_CONFIG: Configuration = {
    appenders: {
        default: {
            type: 'console',
        },
    },
    categories: {
        default: {
            appenders: ['default'],
            level: 'ALL',
        },
    },
}

configure(LOGGER_CONFIG)

const Logger = {
    getLogger() {
        return _getLogger('default')
    },
}

export default Logger
