// jest.setup.js
// Global test setup

// Increase timeout for debugging if needed
if (process.env.DEBUG_TESTS) {
  jest.setTimeout(60000);
}

// Add any global test utilities here
global.console = {
  ...console,
  // Suppress console.log during tests unless DEBUG_TESTS is set
  log: process.env.DEBUG_TESTS ? console.log : jest.fn(),
  debug: process.env.DEBUG_TESTS ? console.debug : jest.fn(),
  warn: console.warn,
  error: console.error,
};