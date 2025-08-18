module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  testTimeout: 10000,
  collectCoverage: true,
  coverageReporters: ['text', 'lcov', 'html'],
  coverageDirectory: 'coverage',
  
  fakeTimers: {
    enableGlobally: false,
    doNotFake: ['nextTick'],
  },
  
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
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
        tsconfig: 'tsconfig.test.json' // Point to your test tsconfig
      },
    ],
  },
  
  moduleFileExtensions: ['ts', 'js', 'json'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/'
  ],
  
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@nodes/(.*)$': '<rootDir>/nodes/$1',
    '^@credentials/(.*)$': '<rootDir>/credentials/$1',
    '^@test-shared/(.*)$': '<rootDir>/__tests__/nodes/CreateJ2vMovie/utils/requestBuilder/shared/$1',
  },
};