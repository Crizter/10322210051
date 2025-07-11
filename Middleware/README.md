# Logging Middleware

A reusable TypeScript/JavaScript logging middleware package that sends logs to a centralized logging API while providing comprehensive local logging capabilities.

## Installation

```bash
npm install @middleware/logging
```

## Quick Start

```typescript
import { Log } from '@middleware/logging';

// Basic usage - matches required signature: Log(stack, level, package, message)
await Log('backend', 'error', 'handler', 'received string, expected bool');
await Log('backend', 'fatal', 'db', 'Critical database connection failure.');
await Log('frontend', 'info', 'component', 'User clicked submit button');
```

## API Reference

### Main Log Function

```typescript
Log(stack: Stack, level: Level, package: Package, message: string): Promise<LogResponse | null>
```

**Parameters:**
- `stack`: Either `'backend'` or `'frontend'`
- `level`: One of `'debug'`, `'info'`, `'warn'`, `'error'`, `'fatal'`
- `package`: Valid package name (see package restrictions below)
- `message`: Descriptive log message

### Package Restrictions

**Backend-only packages:**
- `cache`, `controller`, `cron_job`, `db`, `domain`, `handler`, `repository`, `route`, `service`

**Frontend-only packages:**
- `api`, `component`, `hook`, `page`, `state`, `style`

**Shared packages (both backend and frontend):**
- `auth`, `config`, `middleware`, `utils`

### Logger Class

For more control, use the Logger class directly:

```typescript
import { Logger } from '@middleware/logging';

const logger = new Logger({
  apiUrl: 'http://20.244.56.144/evaluation-service/logs',
  apiKey: 'your-api-key',
  timeout: 10000,
  retryAttempts: 3,
  enableConsole: true,
  environment: 'production'
});

// Use convenience methods
await logger.error('backend', 'handler', 'Database connection failed');
await logger.info('frontend', 'component', 'Page loaded successfully');
```

## Configuration Options

```typescript
interface LoggerConfig {
  apiUrl?: string;           // Default: 'http://20.244.56.144/evaluation-service/logs'
  apiKey?: string;           // Optional API key for authentication
  timeout?: number;          // Request timeout in ms (default: 10000)
  retryAttempts?: number;    // Number of retry attempts (default: 3)
  enableConsole?: boolean;   // Enable console logging (default: true)
  environment?: 'development' | 'staging' | 'production';
}
```

## Usage Examples

### Backend Application

```typescript
import { Log, createLogger } from '@middleware/logging';

// Configure for your environment
const logger = createLogger({
  apiKey: process.env.LOG_API_KEY,
  environment: 'production'
});

// In your route handler
app.post('/api/users', async (req, res) => {
  try {
    await Log('backend', 'info', 'handler', 'Creating new user');
    
    const user = await createUser(req.body);
    
    await Log('backend', 'info', 'handler', `User created successfully: ${user.id}`);
    res.json(user);
  } catch (error) {
    await Log('backend', 'error', 'handler', `User creation failed: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// In your database layer
async function connectToDatabase() {
  try {
    await Log('backend', 'info', 'db', 'Attempting database connection');
    // connection logic...
    await Log('backend', 'info', 'db', 'Database connected successfully');
  } catch (error) {
    await Log('backend', 'fatal', 'db', 'Critical database connection failure');
    throw error;
  }
}
```

### Frontend Application

```typescript
import { Log } from '@middleware/logging';

// In a React component
function UserForm() {
  const handleSubmit = async (formData) => {
    try {
      await Log('frontend', 'info', 'component', 'User submitted registration form');
      
      const response = await fetch('/api/register', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        await Log('frontend', 'info', 'api', 'User registration successful');
      } else {
        await Log('frontend', 'error', 'api', `Registration failed: ${response.status}`);
      }
    } catch (error) {
      await Log('frontend', 'error', 'component', `Form submission error: ${error.message}`);
    }
  };
}

// In a custom hook
function useApiCall() {
  const [loading, setLoading] = useState(false);
  
  const makeRequest = async (url) => {
    setLoading(true);
    await Log('frontend', 'debug', 'hook', `Making API call to ${url}`);
    
    try {
      const response = await fetch(url);
      await Log('frontend', 'info', 'hook', `API call successful: ${response.status}`);
      return response.json();
    } catch (error) {
      await Log('frontend', 'error', 'hook', `API call failed: ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  return { makeRequest, loading };
}
```

## Error Handling

The logging middleware is designed to never break your application:

- **API failures** are handled gracefully with retry logic
- **Network errors** don't throw exceptions
- **Invalid configurations** log warnings but continue working
- **Console logging** always works as a fallback

## Development

```bash
# Install dependencies
npm install

# Build the package
npm run build

# Run tests
npm test

# Watch mode for development
npm run dev
```

## License

MIT
