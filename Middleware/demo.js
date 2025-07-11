
/**
 node demo.js
 */

const { Logger, Log } = require('./dist/index.js');

//  authorization token
const AUTH_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiIxMDMyMjIxMDA1MUBzdHUuc3JtdW5pdmVyc2l0eS5hYy5pbiIsImV4cCI6MTc1MjIyMzQxOSwiaWF0IjoxNzUyMjIyNTE5LCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiOGY5NThmOTYtNTk0YS00Mjg4LWE2NTktZTQxOGJkZDQyYmFkIiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoiaGFyc2ggc2hhcm1hIiwic3ViIjoiMGRkYmU3ZDktY2M0Ny00MzlmLWI3YjctNmJmZDIxNDdlN2VhIn0sImVtYWlsIjoiMTAzMjIyMTAwNTFAc3R1LnNybXVuaXZlcnNpdHkuYWMuaW4iLCJuYW1lIjoiaGFyc2ggc2hhcm1hIiwicm9sbE5vIjoiMTAzMjIyMTAwNTEiLCJhY2Nlc3NDb2RlIjoiRmJHZ0ZVIiwiY2xpZW50SUQiOiIwZGRiZTdkOS1jYzQ3LTQzOWYtYjdiNy02YmZkMjE0N2U3ZWEiLCJjbGllbnRTZWNyZXQiOiJEREpaQ1FlUm1RU3NzQnJIIn0.peqYslGuB2hF7enDG05Zv9K2nxIIYowrql73zCQj1wM";

async function demonstrateLogging() {
  console.log('🚀 Starting Logging Middleware Demo\n');

  // logger instance
  const logger = new Logger({
    enableConsole: true,
    authToken: AUTH_TOKEN
  });

  try {
    // Test backend logging
    console.log('📱 Testing Backend Logging:');
    let logId = await logger.error('backend', 'handler', 'received string, expected bool');
    console.log(`Log ID: ${logId}\n`);

    logId = await logger.fatal('backend', 'db', 'Critical database connection failure.');
    console.log(`Log ID: ${logId}\n`);

    logId = await logger.info('backend', 'service', 'User authentication successful');
    console.log(`Log ID: ${logId}\n`);

    // Test frontend logging
    console.log('🌐 Testing Frontend Logging:');
    logId = await logger.warn('frontend', 'component', 'Component re-render detected');
    console.log(`Log ID: ${logId}\n`);

    logId = await logger.debug('frontend', 'api', 'API response received in 250ms');
    console.log(`Log ID: ${logId}\n`);

    // Test shared packages
    console.log('🔧 Testing Shared Package Logging:');
    logId = await logger.info('backend', 'auth', 'JWT token validated successfully');
    console.log(`Log ID: ${logId}\n`);

    logId = await logger.warn('frontend', 'utils', 'Local storage quota exceeded');
    console.log(`Log ID: ${logId}\n`);

    // Test static Log 
    console.log('⚡ Testing Static Log Function:');
    logId = await Log('backend', 'info', 'middleware', 'Request processed successfully', AUTH_TOKEN);
    console.log(`Log ID: ${logId}\n`);

    // Test convenience 
    console.log('🎯 Testing Convenience Methods:');
    logId = await logger.debug('backend', 'controller', 'Processing user request');
    console.log(`Debug Log ID: ${logId}\n`);

    logId = await logger.info('frontend', 'page', 'Page loaded successfully');
    console.log(`Info Log ID: ${logId}\n`);

    logId = await logger.warn('backend', 'cache', 'Cache miss detected');
    console.log(`Warn Log ID: ${logId}\n`);

    console.log('✅ Demo completed successfully!');

  } catch (error) {
    console.error('❌ Error during demo:', error.message);
  }
}

// Test validation errors
async function testValidation() {
  console.log('\n🔍 Testing Package Validation:');
  
  const logger = new Logger({ authToken: AUTH_TOKEN });

  try {
    await logger.log('backend', 'info', 'component', 'This should fail');
  } catch (error) {
    console.log('✅ Correctly caught error:', error.message);
  }

  try {
    await logger.log('frontend', 'info', 'db', 'This should also fail');
  } catch (error) {
    console.log('✅ Correctly caught error:', error.message);
  }
}

// Run the demo
demonstrateLogging().then(() => {
  return testValidation();
}).catch(console.error);
