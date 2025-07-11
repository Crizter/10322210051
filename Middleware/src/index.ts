import { Logger } from './Logger';
import { LoggerConfig } from './types';

// logger instance
const defaultLogger = new Logger();

/**
 Log function  Log(stack, level, package, message)
 */
export const Log = defaultLogger.log.bind(defaultLogger);


export * from './types';
export { Logger };


export const createLogger = (config?: LoggerConfig) => {
  return new Logger(config);
};


export { defaultLogger as logger };


export const debug = defaultLogger.debug.bind(defaultLogger);
export const info = defaultLogger.info.bind(defaultLogger);
export const warn = defaultLogger.warn.bind(defaultLogger);
export const error = defaultLogger.error.bind(defaultLogger);
export const fatal = defaultLogger.fatal.bind(defaultLogger);
