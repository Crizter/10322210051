import { Logger } from './Logger';
import { LoggerConfig } from './types';

// Create a default logger instance
const defaultLogger = new Logger();

/**
 * Default Log function that matches the required signature: Log(stack, level, package, message)
 */
export const Log = defaultLogger.log.bind(defaultLogger);

// Export all types and classes
export * from './types';
export { Logger };

// Export convenience methods
export const createLogger = (config?: LoggerConfig) => {
  return new Logger(config);
};

// Export the default logger instance for direct use
export { defaultLogger as logger };

// Export individual log level functions
export const debug = defaultLogger.debug.bind(defaultLogger);
export const info = defaultLogger.info.bind(defaultLogger);
export const warn = defaultLogger.warn.bind(defaultLogger);
export const error = defaultLogger.error.bind(defaultLogger);
export const fatal = defaultLogger.fatal.bind(defaultLogger);
