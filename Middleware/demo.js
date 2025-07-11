#!/usr/bin/env node

/**
 * Demo script showing the logging middleware in action
 * Run with: node demo.js
 */

const { Log, Logger, createLogger } = require('./dist/index');

async function runDemo() {
  console.log('🚀 Starting Logging Middleware Demo\n');

  // Example 1: Basic Log function usage
  console.log('1. Basic Log Function Examples:');
  try {
    await Log('backend', 'error', 'handler', 'received string, expected bool');
    await Log('backend', 'fatal', 'db', 'Critical database connection failure.');
    await Log('backend', 'info', 'service', 'User authentication successful');
    await Log('frontend', 'info', 'component', 'User clicked submit button');
    await Log('frontend', 'warn', 'api', 'API response took longer than expected');
  } catch (error) {
    console.error('Error in basic logging:', error.message);
  }

  console.log('\n2. Logger Class with Configuration:');
  
  // Example 2: Configured logger
  const logger = new Logger({
    enableConsole: true,
    retryAttempts: 2,
    environment: 'development'
  });

  try {
    await logger.debug('backend', 'db', 'Connecting to database...');
    await logger.info('backend', 'auth', 'User session initialized');
    await logger.warn('frontend', 'component', 'Deprecated prop usage detected');
    await logger.error('backend', 'cache', 'Redis connection timeout');
  } catch (error) {
    console.error('Error in configured logging:', error.message);
  }

  console.log('\n3. Shared Package Examples (work with both backend/frontend):');
  
  try {
    await Log('backend', 'info', 'auth', 'JWT token generated successfully');
    await Log('frontend', 'info', 'auth', 'User authentication status checked');
    await Log('backend', 'debug', 'utils', 'Data validation completed');
    await Log('frontend', 'debug', 'utils', 'Form data sanitized');
  } catch (error) {
    console.error('Error in shared package logging:', error.message);
  }

  console.log('\n4. Error Handling Demo (invalid package for stack):');
  
  try {
    // This should fail - 'component' is frontend-only, can't be used with 'backend'
    await Log('backend', 'info', 'component', 'This should fail');
  } catch (error) {
    console.log('✅ Expected error caught:', error.message);
  }

  try {
    // This should also fail - 'db' is backend-only, can't be used with 'frontend'
    await Log('frontend', 'info', 'db', 'This should also fail');
  } catch (error) {
    console.log('✅ Expected error caught:', error.message);
  }

  console.log('\n🎉 Demo completed! Check the console output above.');
  console.log('\n📝 Note: API calls to the test server may fail if the server is unavailable,');
  console.log('   but console logging will always work as a fallback.');
}

// Run the demo
runDemo().catch(console.error);
