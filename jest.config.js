module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  testTimeout: 10000, // Reduced from 60000 since we're using fake timers
  collectCoverage: true,
  coverageReporters: ['text', 'lcov', 'html'],
  coverageDirectory: 'coverage',
  
  // Configure fake timers properly
  fakeTimers: {
    enableGlobally: false, // Don't enable globally, let tests control it
    doNotFake: ['nextTick'], // Don't fake nextTick to avoid issues with promises
  },
  
  // Set test environment variables
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'], // Optional setup file
  
  collectCoverageFrom: [
    'credentials/**/*.ts',
    'nodes/**/*.ts',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/*.d.ts',
  ],
  
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json',
      },
    ],
  },
  
  moduleFileExtensions: ['ts', 'js', 'json'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/'
  ],
};