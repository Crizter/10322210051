
import { Log, Logger, createLogger } from './src/index';

// usage with the main Log function
async function basicUsageExample() {
  // Backend examples
  await Log('backend', 'error', 'handler', 'received string, expected bool');
  await Log('backend', 'fatal', 'db', 'Critical database connection failure.');
  await Log('backend', 'info', 'service', 'User authentication successful');
  
  // Frontend examples  
  await Log('frontend', 'info', 'component', 'User clicked submit button');
  await Log('frontend', 'error', 'api', 'Failed to fetch user data: 404 Not Found');
  await Log('frontend', 'debug', 'hook', 'useEffect triggered for user data');
}

//  logger class with configuration
async function configuredLoggerExample() {
  const logger = new Logger({
    apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiIxMDMyMjIxMDA1MUBzdHUuc3JtdW5pdmVyc2l0eS5hYy5pbiIsImV4cCI6MTc1MjIxOTU0MCwiaWF0IjoxNzUyMjE4NjQwLCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiNjc4ZDk0YzEtOTFiNC00MmIyLTgzZjYtZDBkOTIzY2E5MDFhIiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoiaGFyc2ggc2hhcm1hIiwic3ViIjoiMGRkYmU3ZDktY2M0Ny00MzlmLWI3YjctNmJmZDIxNDdlN2VhIn0sImVtYWlsIjoiMTAzMjIyMTAwNTFAc3R1LnNybXVuaXZlcnNpdHkuYWMuaW4iLCJuYW1lIjoiaGFyc2ggc2hhcm1hIiwicm9sbE5vIjoiMTAzMjIyMTAwNTEiLCJhY2Nlc3NDb2RlIjoiRmJHZ0ZVIiwiY2xpZW50SUQiOiIwZGRiZTdkOS1jYzQ3LTQzOWYtYjdiNy02YmZkMjE0N2U3ZWEiLCJjbGllbnRTZWNyZXQiOiJEREpaQ1FlUm1RU3NzQnJIIn0.Rw0d3GXCgmm5TLZCGPkoR-mMJgsk-UnxJ4cGR2jK19Q',
    environment: 'production',
    enableConsole: true,
    retryAttempts: 5
  });

  // Use convenience methods
  await logger.error('backend', 'db', 'Connection pool exhausted');
  await logger.warn('frontend', 'component', 'Deprecated prop usage detected');
  await logger.info('backend', 'auth', 'JWT token refreshed successfully');
}

//  Express.js middleware integration
function expressMiddlewareExample() {
  const express = require('express');
  const app = express();

  //  logging middleware
  app.use(async (req, res, next) => {
    await Log('backend', 'info', 'middleware', `${req.method} ${req.path} - ${req.ip}`);
    next();
  });

  //  error handling
  app.get('/api/users/:id', async (req, res) => {
    try {
      await Log('backend', 'debug', 'handler', `Fetching user with ID: ${req.params.id}`);
      
      const user = await getUserById(req.params.id);
      if (!user) {
        await Log('backend', 'warn', 'handler', `User not found: ${req.params.id}`);
        return res.status(404).json({ error: 'User not found' });
      }
      
      await Log('backend', 'info', 'handler', `User retrieved successfully: ${user.id}`);
      res.json(user);
    } catch (error) {
      await Log('backend', 'error', 'handler', `Error fetching user: ${error.message}`);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
}

//  react component with logging
function ReactComponentExample() {
  const React = require('react');
  
  function UserProfile({ userId }) {
    const [user, setUser] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
      async function loadUser() {
        try {
          await Log('frontend', 'debug', 'component', `Loading user profile: ${userId}`);
          setLoading(true);
          
          const response = await fetch(`/api/users/${userId}`);
          if (!response.ok) {
            await Log('frontend', 'error', 'api', `Failed to load user: ${response.status}`);
            throw new Error('Failed to load user');
          }
          
          const userData = await response.json();
          setUser(userData);
          await Log('frontend', 'info', 'component', `User profile loaded successfully: ${userId}`);
        } catch (error) {
          await Log('frontend', 'error', 'component', `Error loading user profile: ${error.message}`);
        } finally {
          setLoading(false);
        }
      }

      if (userId) {
        loadUser();
      }
    }, [userId]);

    if (loading) return React.createElement('div', null, 'Loading...');
    if (!user) return React.createElement('div', null, 'User not found');
    
    return React.createElement('div', null, `Hello, ${user.name}!`);
  }
}

// database example
async function databaseExample() {
  const logger = createLogger({ enableConsole: true });

  // Connection management
  async function connectDatabase() {
    try {
      await logger.info('backend', 'db', 'Initializing database connection pool');
      // database connection logic...
      await logger.info('backend', 'db', 'Database connection pool initialized successfully');
    } catch (error) {
      await logger.fatal('backend', 'db', `Failed to initialize database: ${error.message}`);
      throw error;
    }
  }

  // Query eg
  async function findUser(email) {
    try {
      await logger.debug('backend', 'repository', `Searching for user with email: ${email}`);
      
    .
      const user = {}; // mock user
      
      if (user) {
        await logger.info('backend', 'repository', `User found: ${user.id || 'mock'}`);
        return user;
      } else {
        await logger.warn('backend', 'repository', `No user found with email: ${email}`);
        return null;
      }
    } catch (error) {
      await logger.error('backend', 'repository', `Database query failed: ${error.message}`);
      throw error;
    }
  }
}

// Cache eg
async function cacheExample() {
  async function getCachedData(key) {
    try {
      await Log('backend', 'debug', 'cache', `Attempting to retrieve key: ${key}`);
      

      const data = null;
      
      if (data) {
        await Log('backend', 'info', 'cache', `Cache hit for key: ${key}`);
        return data;
      } else {
        await Log('backend', 'debug', 'cache', `Cache miss for key: ${key}`);
        return null;
      }
    } catch (error) {
      await Log('backend', 'error', 'cache', `Cache retrieval failed: ${error.message}`);
      return null;
    }
  }

  async function setCachedData(key, data, ttl = 3600) {
    try {
      await Log('backend', 'debug', 'cache', `Setting cache key: ${key} with TTL: ${ttl}s`);
      
      // cache setting logic...
      
      await Log('backend', 'info', 'cache', `Successfully cached key: ${key}`);
    } catch (error) {
      await Log('backend', 'error', 'cache', `Failed to cache key ${key}: ${error.message}`);
    }
  }
}

// auth log
async function authExample() {
  async function loginUser(email, password) {
    try {
      await Log('backend', 'info', 'auth', `Login attempt for email: ${email}`);
      
      // authentication logic...
      const isValid = true; // mock successful auth
      
      if (isValid) {
        await Log('backend', 'info', 'auth', `Successful login for user: ${email}`);
        return { success: true, token: 'mock-jwt-token' };
      } else {
        await Log('backend', 'warn', 'auth', `Failed login attempt for email: ${email}`);
        return { success: false };
      }
    } catch (error) {
      await Log('backend', 'error', 'auth', `Authentication error: ${error.message}`);
      throw error;
    }
  }

  async function validateToken(token) {
    try {
      await Log('backend', 'debug', 'auth', 'Validating JWT token');
      
      // token validation logic...
      const isValid = true; // mock validation
      
      if (isValid) {
        await Log('backend', 'debug', 'auth', 'JWT token validation successful');
        return true;
      } else {
        await Log('backend', 'warn', 'auth', 'Invalid JWT token provided');
        return false;
      }
    } catch (error) {
      await Log('backend', 'error', 'auth', `Token validation error: ${error.message}`);
      return false;
    }
  }
}

export {
  basicUsageExample,
  configuredLoggerExample,
  expressMiddlewareExample,
  ReactComponentExample,
  databaseExample,
  cacheExample,
  authExample
};
