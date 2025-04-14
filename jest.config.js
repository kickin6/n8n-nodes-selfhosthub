module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  testTimeout: 60000,
  collectCoverage: true,
  coverageReporters: ['text', 'lcov', 'html'],
  coverageDirectory: 'coverage',
  // Disable fake timers - we're using 1ms real timeouts instead for better compatibility
  fakeTimers: {
    enableGlobally: false,
  },
  // Set test environment variables
  globals: {
    'process.env': {
      NODE_ENV: 'test',
    },
  },
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
