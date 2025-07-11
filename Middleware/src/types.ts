/**
 * Type definitions for the logging middleware
 */

/**
 * Valid stack values for logging
 */
export type Stack = 'backend' | 'frontend';

/**
 * Valid log levels
 */
export type Level = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

/**
 * Packages that can be used in both backend and frontend
 */
export type Package = 
  // Backend only packages
  | 'cache' | 'controller' | 'cron_job' | 'db' | 'domain' 
  | 'handler' | 'repository' | 'route' | 'service'
  // Frontend only packages  
  | 'api' | 'component' | 'hook' | 'page' | 'state' | 'style'
  // Shared packages
  | 'auth' | 'config' | 'middleware' | 'utils';

/**
 * Log request payload
 */
export interface LogEntry {
  stack: Stack;
  level: Level;
  package: Package;
  message: string;
}

/**
 * Logger configuration options
 */
export interface LoggerConfig {
  enableConsole?: boolean;
  retryAttempts?: number;
  retryDelay?: number;
  authToken?: string;
}

/**
 * Log response from the API
 */
export interface LogResponse {
  logID: string;
  message: string;
}

/**
 * Logger class interface
 */
export interface ILogger {
  log(stack: Stack, level: Level, pkg: Package, message: string): Promise<LogResponse | null>;
  debug(stack: Stack, pkg: Package, message: string): Promise<LogResponse | null>;
  info(stack: Stack, pkg: Package, message: string): Promise<LogResponse | null>;
  warn(stack: Stack, pkg: Package, message: string): Promise<LogResponse | null>;
  error(stack: Stack, pkg: Package, message: string): Promise<LogResponse | null>;
  fatal(stack: Stack, pkg: Package, message: string): Promise<LogResponse | null>;
}
