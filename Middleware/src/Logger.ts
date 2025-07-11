import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  Stack, 
  Level, 
  Package, 
  LogRequest, 
  LogResponse, 
  LoggerConfig, 
  ILogger,
  BackendPackage,
  FrontendPackage 
} from './types';

/**
 * Logger class that implements the logging middleware
 */
export class Logger implements ILogger {
  private api: AxiosInstance;
  private config: Required<LoggerConfig>;

  constructor(config: LoggerConfig = {}) {
    this.config = {
      apiUrl: config.apiUrl || 'http://20.244.56.144/evaluation-service/logs',
      apiKey: config.apiKey || '',
      timeout: config.timeout || 10000,
      retryAttempts: config.retryAttempts || 3,
      enableConsole: config.enableConsole ?? true,
      environment: config.environment || 'development'
    };

    this.api = axios.create({
      baseURL: this.config.apiUrl,
      timeout: this.config.timeout,
     headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiIxMDMyMjIxMDA1MUBzdHUuc3JtdW5pdmVyc2l0eS5hYy5pbiIsImV4cCI6MTc1MjIxOTU0MCwiaWF0IjoxNzUyMjE4NjQwLCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiNjc4ZDk0YzEtOTFiNC00MmIyLTgzZjYtZDBkOTIzY2E5MDFhIiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoiaGFyc2ggc2hhcm1hIiwic3ViIjoiMGRkYmU3ZDktY2M0Ny00MzlmLWI3YjctNmJmZDIxNDdlN2VhIn0sImVtYWlsIjoiMTAzMjIyMTAwNTFAc3R1LnNybXVuaXZlcnNpdHkuYWMuaW4iLCJuYW1lIjoiaGFyc2ggc2hhcm1hIiwicm9sbE5vIjoiMTAzMjIyMTAwNTEiLCJhY2Nlc3NDb2RlIjoiRmJHZ0ZVIiwiY2xpZW50SUQiOiIwZGRiZTdkOS1jYzQ3LTQzOWYtYjdiNy02YmZkMjE0N2U3ZWEiLCJjbGllbnRTZWNyZXQiOiJEREpaQ1FlUm1RU3NzQnJIIn0.Rw0d3GXCgmm5TLZCGPkoR-mMJgsk-UnxJ4cGR2jK19Q'
  }
    });
  }

  /**
   * Validates if a package is valid for the given stack
   */
  private validatePackageForStack(stack: Stack, pkg: Package): boolean {
    const backendPackages: BackendPackage[] = [
      'cache', 'controller', 'cron_job', 'db', 'domain', 
      'handler', 'repository', 'route', 'service'
    ];
    
    const frontendPackages: FrontendPackage[] = [
      'api', 'component', 'hook', 'page', 'state', 'style'
    ];
    
    const sharedPackages = ['auth', 'config', 'middleware', 'utils'];

    if (stack === 'backend') {
      return backendPackages.includes(pkg as BackendPackage) || sharedPackages.includes(pkg);
    } else {
      return frontendPackages.includes(pkg as FrontendPackage) || sharedPackages.includes(pkg);
    }
  }

  /**
   * Logs to console if enabled
   */
  private logToConsole(level: Level, stack: Stack, pkg: Package, message: string): void {
    if (!this.config.enableConsole) return;

    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] [${stack}:${pkg}] ${message}`;

    switch (level) {
      case 'debug':
        console.debug(logMessage);
        break;
      case 'info':
        console.info(logMessage);
        break;
      case 'warn':
        console.warn(logMessage);
        break;
      case 'error':
      case 'fatal':
        console.error(logMessage);
        break;
      default:
        console.log(logMessage);
    }
  }

  /**
   * Makes API call with retry logic
   */
  private async makeApiCall(payload: LogRequest, attempt: number = 1): Promise<LogResponse | null> {
    try {
      const response: AxiosResponse<LogResponse> = await this.api.post('', payload);
      return response.data;
    } catch (error) {
      console.error(`Log API call failed (attempt ${attempt}/${this.config.retryAttempts}):`, error);
      
      if (attempt < this.config.retryAttempts) {
        // Exponential backoff
        const delay = Math.pow(2, attempt - 1) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.makeApiCall(payload, attempt + 1);
      }
      
      return null;
    }
  }

  /**
   * Main logging function
   */
  async log(stack: Stack, level: Level, pkg: Package, message: string): Promise<LogResponse | null> {
    // Validate inputs
    if (!this.validatePackageForStack(stack, pkg)) {
      const error = `Invalid package '${pkg}' for stack '${stack}'`;
      console.error(error);
      throw new Error(error);
    }

    // Always log to console first
    this.logToConsole(level, stack, pkg, message);

    // Prepare payload
    const payload: LogRequest = {
      stack,
      level,
      package: pkg,
      message
    };

    // Make API call
    try {
      return await this.makeApiCall(payload);
    } catch (error) {
      console.error('Failed to send log to API after all retries:', error);
      return null;
    }
  }

  /**
   * Debug level logging
   */
  async debug(stack: Stack, pkg: Package, message: string): Promise<LogResponse | null> {
    return this.log(stack, 'debug', pkg, message);
  }

  /**
   * Info level logging
   */
  async info(stack: Stack, pkg: Package, message: string): Promise<LogResponse | null> {
    return this.log(stack, 'info', pkg, message);
  }

  /**
   * Warning level logging
   */
  async warn(stack: Stack, pkg: Package, message: string): Promise<LogResponse | null> {
    return this.log(stack, 'warn', pkg, message);
  }

  /**
   * Error level logging
   */
  async error(stack: Stack, pkg: Package, message: string): Promise<LogResponse | null> {
    return this.log(stack, 'error', pkg, message);
  }

  /**
   * Fatal level logging
   */
  async fatal(stack: Stack, pkg: Package, message: string): Promise<LogResponse | null> {
    return this.log(stack, 'fatal', pkg, message);
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Recreate axios instance if URL or auth changed
    if (newConfig.apiUrl || newConfig.apiKey) {
      this.api = axios.create({
        baseURL: this.config.apiUrl,
        timeout: this.config.timeout,
         headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ...K19Q'
        }
      });
    }
  }
}
