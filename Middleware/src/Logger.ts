import axios, { AxiosInstance, AxiosError } from 'axios';
import { Stack, Level, Package, LoggerConfig, LogEntry } from './types';

export class Logger {
  private axiosInstance: AxiosInstance;
  private config: LoggerConfig;

  constructor(config: LoggerConfig = {}) {
    this.config = {
      enableConsole: true,
      retryAttempts: 3,
      retryDelay: 1000,
      ...config
    };

    // Format authorization header with token_type
    const authHeader = this.config.authToken 
      ? `Bearer ${this.config.authToken}`
      : undefined;

    this.axiosInstance = axios.create({
      baseURL: 'http://20.244.56.144',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader })
      }
    });
  }

  private validatePackageForStack(stack: Stack, pkg: Package): void {
    const backendOnlyPackages: Package[] = ['cache', 'controller', 'cron_job', 'db', 'domain', 'handler', 'repository', 'route', 'service'];
    const frontendOnlyPackages: Package[] = ['api', 'component', 'hook', 'page', 'state', 'style'];
    const sharedPackages: Package[] = ['auth', 'config', 'middleware', 'utils'];

    if (stack === 'backend' && frontendOnlyPackages.includes(pkg)) {
      throw new Error(`Package '${pkg}' is not allowed for backend stack`);
    }

    if (stack === 'frontend' && backendOnlyPackages.includes(pkg)) {
      throw new Error(`Package '${pkg}' is not allowed for frontend stack`);
    }
  }

  private async sendToAPI(logEntry: LogEntry): Promise<string | null> {
    for (let attempt = 1; attempt <= this.config.retryAttempts!; attempt++) {
      try {
        const response = await this.axiosInstance.post('/evaluation-service/logs', logEntry);
        return response.data.logID;
      } catch (error) {
        if (attempt === this.config.retryAttempts) {
          if (this.config.enableConsole) {
            console.error(`Failed to send log to API after ${this.config.retryAttempts} attempts:`, error instanceof AxiosError ? error.message : error);
          }
          return null;
        }
        await new Promise(resolve => setTimeout(resolve, this.config.retryDelay! * attempt));
      }
    }
    return null;
  }

  private logToConsole(stack: Stack, level: Level, pkg: Package, message: string): void {
    if (!this.config.enableConsole) return;

    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] [${stack}:${pkg}] ${message}`;
    
    switch (level) {
      case 'fatal':
      case 'error':
        console.error(logMessage);
        break;
      case 'warn':
        console.warn(logMessage);
        break;
      case 'debug':
        console.debug(logMessage);
        break;
      default:
        console.log(logMessage);
    }
  }

  async log(stack: Stack, level: Level, pkg: Package, message: string): Promise<string | null> {
    this.validatePackageForStack(stack, pkg);
    
    const logEntry: LogEntry = {
      stack,
      level,
      package: pkg,
      message
    };

    this.logToConsole(stack, level, pkg, message);

    if (this.config.authToken) {
      return await this.sendToAPI(logEntry);
    } else {
      if (this.config.enableConsole) {
        console.warn('No auth token provided, skipping API call');
      }
      return null;
    }
  }

  // Convenience methods for different log levels
  async debug(stack: Stack, pkg: Package, message: string): Promise<string | null> {
    return this.log(stack, 'debug', pkg, message);
  }

  async info(stack: Stack, pkg: Package, message: string): Promise<string | null> {
    return this.log(stack, 'info', pkg, message);
  }

  async warn(stack: Stack, pkg: Package, message: string): Promise<string | null> {
    return this.log(stack, 'warn', pkg, message);
  }

  async error(stack: Stack, pkg: Package, message: string): Promise<string | null> {
    return this.log(stack, 'error', pkg, message);
  }

  async fatal(stack: Stack, pkg: Package, message: string): Promise<string | null> {
    return this.log(stack, 'fatal', pkg, message);
  }
}

// Static method for quick logging without instantiation
export const Log = async (stack: Stack, level: Level, pkg: Package, message: string, authToken?: string): Promise<string | null> => {
  const logger = new Logger({ authToken });
  return logger.log(stack, level, pkg, message);
};