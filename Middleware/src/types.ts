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
 * Backend-only packages
 */
export type BackendPackage = 
  | 'cache'
  | 'controller'
  | 'cron_job'
  | 'db'
  | 'domain'
  | 'handler'
  | 'repository'
  | 'route'
  | 'service';

/**
 * Frontend-only packages
 */
export type FrontendPackage = 
  | 'api'
  | 'component'
  | 'hook'
  | 'page'
  | 'state'
  | 'style';

/**
 * Packages that can be used in both backend and frontend
 */
export type SharedPackage = 
  | 'auth'
  | 'config'
  | 'middleware'
  | 'utils';

/**
 * All valid package types
 */
export type Package = BackendPackage | FrontendPackage | SharedPackage;

/**
 * Log request payload
 */
export interface LogRequest {
  stack: Stack;
  level: Level;
  package: Package;
  message: string;
}

/**
 * Log response from the API
 */
export interface LogResponse {
  logID: string;
  message: string;
}

/**
 * Logger configuration options
 */
export interface LoggerConfig {
  apiUrl?: string;
  apiKey?: string;
  timeout?: number;
  retryAttempts?: number;
  enableConsole?: boolean;
  environment?: 'development' | 'staging' | 'production';
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
