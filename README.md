# URL Shortener with Custom Logging Middleware

A full-stack URL shortening service built with React, Node.js, Express, and MongoDB, featuring a custom logging middleware for comprehensive application monitoring.

## Project Structure

```
├── client/               # Frontend React application
│   └── myapp/
│       ├── src/
│       │   ├── pages/   # URL Shortener and Stats pages
│       │   ├── api/     # API integration
│       │   └── App.jsx  # Main application component
│       └── package.json
├── Middleware/          # Custom Logging Middleware
│   ├── src/
│   │   ├── Logger.ts   # Logger implementation
│   │   └── types.ts    # TypeScript type definitions
│   └── package.json
└── server/             # Backend Express server
    ├── src/
    │   ├── models/     # MongoDB schemas
    │   ├── utils/      # Utility functions
    │   └── server.js   # Express application
    └── package.json
```

## Features

### URL Shortener Interface
![URL Shortener Interface](screenshots/url-shortener.png)
- Shorten multiple URLs simultaneously (up to 5)
- Optional custom shortcode (5-7 alphanumeric characters)
- Configurable validity period
- Real-time validation
- Material UI components for modern look and feel

### Backend Features
- MongoDB integration for URL storage
- Click tracking with geo-location
- Expiry handling
- Custom shortcode support
- RESTful API endpoints

### Custom Logging Middleware
- Stack-based logging (frontend/backend)
- Multiple log levels (debug, info, warn, error, fatal)
- Package-specific logging
- Async operation support
- Console and API logging options

## Tech Stack

- **Frontend**: React, Material UI, React Router
- **Backend**: Node.js, Express, MongoDB
- **Middleware**: TypeScript, Axios
- **Testing**: Jest

## API Endpoints

```
POST /shorturls          # Create shortened URL
GET  /shorturls/:code   # Retrieve URL stats
GET  /:code            # URL redirection
```

## Logging Middleware Usage

```javascript
// Initialize logger
const logger = new Logger({
  enableConsole: true,
  authToken: "your_token"
});

// Example usage
await logger.info('backend', 'handler', 'URL shortened successfully');
await logger.error('frontend', 'component', 'Failed to fetch stats');
```

## Getting Started

1. **Install Dependencies**
```bash
# Install Middleware dependencies
cd Middleware
npm install
npm run build

# Install Server dependencies
cd ../server
npm install

# Install Client dependencies
cd ../client/myapp
npm install
```

2. **Environment Setup**
```bash
# Server .env
PORT=3000
BASE_URL=http://localhost:3000
MONGODB_URI=your_mongodb_uri

# Add your logging service token
LOGGER_TOKEN=your_token
```

3. **Run the Applications**
```bash
# Start the server
cd server
npm run dev

# Start the client
cd client/myapp
npm run dev
```

## Screenshots

### URL Shortener Page
![URL Shortener Interface](screenshots/url-shortener.png)
- Multiple URL input fields
- Validity configuration
- Custom shortcode option
- Real-time validation

### Terminal Output
![Terminal Output](screenshots/terminal-output.png)
- MongoDB connection status
- Server startup logs
- Request logging
- Error handling

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Thanks to all contributors
- Built as part of the Full Stack Development course
- Inspired by bit.ly and other URL shortening services