import { Logger } from '../src/Logger';
import { Stack, Level, Package } from '../src/types';

// Mock axios to avoid actual API calls during tests
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    post: jest.fn()
  }))
}));

describe('Logger', () => {
  let logger: Logger;

  beforeEach(() => {
    logger = new Logger({
      enableConsole: false // Disable console logging during tests
    });
  });

  describe('Package validation', () => {
    test('should accept valid backend packages', async () => {
      const backendPackages: Package[] = ['cache', 'controller', 'db', 'handler'];
      
      for (const pkg of backendPackages) {
        await expect(logger.log('backend', 'info', pkg, 'test message')).resolves.not.toThrow();
      }
    });

    test('should accept valid frontend packages', async () => {
      const frontendPackages: Package[] = ['api', 'component', 'hook', 'page'];
      
      for (const pkg of frontendPackages) {
        await expect(logger.log('frontend', 'info', pkg, 'test message')).resolves.not.toThrow();
      }
    });

    test('should accept shared packages for both stacks', async () => {
      const sharedPackages: Package[] = ['auth', 'config', 'middleware', 'utils'];
      
      for (const pkg of sharedPackages) {
        await expect(logger.log('backend', 'info', pkg, 'test message')).resolves.not.toThrow();
        await expect(logger.log('frontend', 'info', pkg, 'test message')).resolves.not.toThrow();
      }
    });

    test('should reject frontend packages for backend stack', async () => {
      await expect(logger.log('backend', 'info', 'component', 'test message')).rejects.toThrow();
    });

    test('should reject backend packages for frontend stack', async () => {
      await expect(logger.log('frontend', 'info', 'db', 'test message')).rejects.toThrow();
    });
  });

  describe('Log level methods', () => {
    test('should have debug method', async () => {
      expect(typeof logger.debug).toBe('function');
    });

    test('should have info method', async () => {
      expect(typeof logger.info).toBe('function');
    });

    test('should have warn method', async () => {
      expect(typeof logger.warn).toBe('function');
    });

    test('should have error method', async () => {
      expect(typeof logger.error).toBe('function');
    });

    test('should have fatal method', async () => {
      expect(typeof logger.fatal).toBe('function');
    });
  });
});
